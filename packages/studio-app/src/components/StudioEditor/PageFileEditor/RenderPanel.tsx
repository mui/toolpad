import { styled } from '@mui/system';
import * as React from 'react';
import clsx from 'clsx';
import { SlotType } from '@mui/studio-core';
import {
  NodeId,
  NodeState,
  ViewState,
  FlowDirection,
  SlotLocation,
  SlotState,
} from '../../../types';
import * as studioDom from '../../../studioDom';
import PageView from '../../PageView';
import {
  absolutePositionCss,
  distanceToLine,
  distanceToRect,
  Rectangle,
  rectContainsPoint,
} from '../../../utils/geometry';
import { PinholeOverlay } from '../../../PinholeOverlay';
import { useEditorApi } from '../EditorProvider';
import { getViewState } from '../../../pageViewState';
import { ExactEntriesOf } from '../../../utils/types';
import { useDom, useDomApi } from '../../DomProvider';
import { usePageEditorState } from './PageFileEditorProvider';
import EditorOverlay from './EditorOverlay';

type SlotDirection = 'horizontal' | 'vertical';

const classes = {
  view: 'StudioView',
};

const RenderPanelRoot = styled('div')({
  position: 'relative',
  overflow: 'hidden',

  [`& .${classes.view}`]: {
    height: '100%',
  },
});

const overlayClasses = {
  hud: 'StudioHud',
  nodeHud: 'StudioNodeHud',
  slotHud: 'StudioSlotHud',
  insertSlotHud: 'StudioInsertSlotHud',
  selected: 'StudioSelected',
  allowNodeInteraction: 'StudioAllowNodeInteraction',
  active: 'StudioActive',
  componentDragging: 'StudioComponentDragging',
  selectionHint: 'StudioSelectionHint',
  hudOverlay: 'StudioHudOverlay',
};

const OverlayRoot = styled('div')({
  pointerEvents: 'none',
  width: '100%',
  height: '100%',

  '&:focus': {
    outline: 'none',
  },

  [`& .${overlayClasses.selectionHint}`]: {
    // capture mouse events
    pointerEvents: 'initial',
    cursor: 'grab',
    display: 'none',
    position: 'absolute',
    right: 0,
    background: 'red',
    color: 'white',
    fontSize: 11,
    padding: `0 4px`,
  },

  [`& .${overlayClasses.nodeHud}`]: {
    // capture mouse events
    pointerEvents: 'initial',
    position: 'absolute',
    [`&.${overlayClasses.selected}`]: {
      border: '1px solid red',
      [`& .${overlayClasses.selectionHint}`]: {
        display: 'block',
      },
    },
    [`&.${overlayClasses.allowNodeInteraction}`]: {
      // block pointer-events so we can interact with the selection
      pointerEvents: 'none',
    },
  },

  [`&.${overlayClasses.componentDragging}`]: {
    [`& .${overlayClasses.insertSlotHud}`]: {
      border: '1px dashed #DDD',
    },
  },

  [`& .${overlayClasses.insertSlotHud}`]: {
    position: 'absolute',

    [`&.${overlayClasses.active}`]: {
      border: '1px solid green',
    },
  },

  [`& .${overlayClasses.slotHud}`]: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    color: 'green',
    border: '1px dashed green',
    opacity: 0.5,
    [`&.${overlayClasses.active}`]: {
      border: '1px solid green',
      opacity: 1,
    },
  },

  [`& .${overlayClasses.hudOverlay}`]: {
    position: 'absolute',
    inset: '0 0 0 0',
  },
});

function insertSlotAbsolutePositionCss(slot: {
  direction: SlotDirection;
  x: number;
  y: number;
  size: number;
}): React.CSSProperties {
  return slot.direction === 'horizontal'
    ? {
        left: slot.x,
        top: slot.y,
        height: slot.size,
      }
    : {
        left: slot.x,
        top: slot.y,
        width: slot.size,
      };
}

function findNodeAt(
  nodes: readonly PageOrElementNode[],
  viewLayout: ViewState,
  x: number,
  y: number,
): NodeId | null {
  // Search deepest nested first
  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    const node = nodes[i];
    const nodeLayout = viewLayout[node.id];
    if (nodeLayout && rectContainsPoint(nodeLayout.rect, x, y)) {
      return node.id;
    }
  }
  return null;
}

/**
 * From a collection of slots belonging to a single parent, returns the index of the
 * closest one to a certain point
 */
function findActiveSlotInNode(
  parentId: NodeId,
  slots: NodeSlots,
  x: number,
  y: number,
): SlotLocation | null {
  let closestDistance = Infinity;
  let closestParentProp: string | null = null;
  let closestParentIndex: string | null = null;

  // eslint-disable-next-line no-restricted-syntax
  for (const [parentProp, namedSlots] of Object.entries(slots)) {
    if (namedSlots) {
      for (let j = 0; j < namedSlots.length; j += 1) {
        const namedSlot = namedSlots[j];
        let distance: number;
        if (namedSlot.type === 'single') {
          distance = distanceToRect(namedSlot.rect, x, y);
        } else {
          distance =
            namedSlot.direction === 'horizontal'
              ? distanceToLine(
                  namedSlot.x,
                  namedSlot.y,
                  namedSlot.x,
                  namedSlot.y + namedSlot.size,
                  x,
                  y,
                )
              : distanceToLine(
                  namedSlot.x,
                  namedSlot.y,
                  namedSlot.x + namedSlot.size,
                  namedSlot.y,
                  x,
                  y,
                );
        }

        if (distance <= 0) {
          // We can bail out early here
          return { parentId, parentIndex: namedSlot.parentIndex, parentProp };
        }

        if (distance < closestDistance) {
          closestDistance = distance;
          closestParentProp = parentProp;
          closestParentIndex = namedSlot.parentIndex;
        }
      }
    }
  }

  if (closestParentProp && closestParentIndex) {
    return { parentId, parentProp: closestParentProp, parentIndex: closestParentIndex };
  }

  return null;
}

function findActiveSlotAt(
  nodes: readonly studioDom.StudioNode[],
  viewLayout: ViewState,
  slots: ViewSlots,
  x: number,
  y: number,
): SlotLocation | null {
  // Search deepest nested first
  let nodeLayout: NodeState | undefined;
  let nodeSlots: NodeSlots = {};
  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    const node = nodes[i];
    nodeLayout = viewLayout[node.id];
    nodeSlots = slots[node.id] || {};
    if (nodeLayout && rectContainsPoint(nodeLayout.rect, x, y)) {
      // Initially only consider slots of the node we're hovering
      const slotIndex = findActiveSlotInNode(nodeLayout.nodeId, nodeSlots, x, y);
      if (slotIndex) {
        return slotIndex;
      }
    }
  }
  // One last attempt, using the most shallow nodeLayout we found, regardless of
  // whether we are hovering it
  if (nodeLayout) {
    return findActiveSlotInNode(nodeLayout.nodeId, nodeSlots, x, y);
  }
  return null;
}

type PageOrElementNode = studioDom.StudioPageNode | studioDom.StudioElementNode;

function getSlotDirection(flow: FlowDirection): SlotDirection {
  switch (flow) {
    case 'row':
    case 'row-reverse':
      return 'horizontal';
    case 'column':
    case 'column-reverse':
      return 'vertical';
    default:
      throw new Error(`Invariant: Unrecognized direction "${flow}"`);
  }
}

interface RenderedSlotBase {
  readonly type: SlotType;
  readonly parentIndex: string;
}

interface RenderedSingleSlot extends RenderedSlotBase {
  readonly type: 'single';
  readonly parentIndex: string;
  readonly rect: Rectangle;
}

interface RenderedInsertSlot extends RenderedSlotBase {
  readonly type: 'multiple';
  readonly parentIndex: string;
  readonly direction: SlotDirection;
  readonly x: number;
  readonly y: number;
  readonly size: number;
}

type RenderedSlot = RenderedInsertSlot | RenderedSingleSlot;

function calculateSlots(
  slotState: SlotState,
  children: studioDom.StudioNode[],
  viewState: ViewState,
): RenderedSlot[] {
  const rect = slotState.rect;

  if (slotState.type === 'single') {
    return [
      {
        type: 'single',
        parentIndex: studioDom.createFractionalIndex(null, null),
        rect,
      },
    ];
  }

  const slotDirection = getSlotDirection(slotState.direction);

  const size = slotDirection === 'horizontal' ? rect.height : rect.width;

  const boundaries: { start: number; end: number; parentIndex: string }[] = [];

  for (let i = 0; i < children.length; i += 1) {
    const child = children[i];
    const childState = viewState[child.id];

    if (!child.parentIndex) {
      throw new Error(`Invariant: Node "${child.id}" has no parent`);
    }

    if (!childState) {
      return [];
    }

    const childRect = childState.rect;

    switch (slotState.direction) {
      case 'row':
        boundaries.push({
          start: childRect.x,
          end: childRect.x + childRect.width,
          parentIndex: child.parentIndex,
        });
        break;
      case 'column':
        boundaries.push({
          start: childRect.y,
          end: childRect.y + childRect.height,
          parentIndex: child.parentIndex,
        });
        break;
      case 'row-reverse':
        boundaries.push({
          start: childRect.x + childRect.width,
          end: childRect.x,
          parentIndex: child.parentIndex,
        });
        break;
      case 'column-reverse':
        boundaries.push({
          start: childRect.y + childRect.height,
          end: childRect.y,
          parentIndex: child.parentIndex,
        });
        break;
      default:
        throw new Error(`Invariant: Unrecognized direction "${slotState.direction}"`);
    }
  }

  const offsets: { offset: number; parentIndex: string }[] = [];
  if (boundaries.length > 0) {
    const first = boundaries[0];
    offsets.push({
      offset: first.start,
      parentIndex: studioDom.createFractionalIndex(null, first.parentIndex),
    });
    const lastIdx = boundaries.length - 1;
    for (let i = 0; i < lastIdx; i += 1) {
      const prev = boundaries[i];
      const current = boundaries[i + 1];
      offsets.push({
        offset: (prev.end + current.start) / 2,
        parentIndex: studioDom.createFractionalIndex(prev.parentIndex, current.parentIndex),
      });
    }
    const last = boundaries[lastIdx];
    offsets.push({
      offset: last.end,
      parentIndex: studioDom.createFractionalIndex(last.parentIndex, null),
    });
  }

  return offsets.map(
    ({ offset, parentIndex }) =>
      ({
        type: 'multiple',
        parentIndex,
        direction: slotDirection,
        x: slotDirection === 'horizontal' ? offset : rect.x,
        y: slotDirection === 'horizontal' ? rect.y : offset,
        size,
      } as const),
  );
}

function calculateNodeSlots(
  parent: PageOrElementNode,
  children: studioDom.NodeChildren,
  viewState: ViewState,
): NodeSlots {
  const parentState = viewState[parent.id];

  if (!parentState) {
    return {};
  }

  const result: NodeSlots = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const [parentProp, slotState] of Object.entries(parentState.slots)) {
    if (slotState) {
      const namedChildren = children[parentProp] ?? [];
      result[parentProp] = calculateSlots(slotState, namedChildren, viewState);
    }
  }

  return result;
}

interface NodeSlots {
  [key: string]: RenderedSlot[] | undefined;
}

interface ViewSlots {
  [node: NodeId]: NodeSlots | undefined;
}

export interface RenderPanelProps {
  className?: string;
}

export default function RenderPanel({ className }: RenderPanelProps) {
  const dom = useDom();
  const domApi = useDomApi();
  const api = useEditorApi();
  const {
    selection,
    newNode,
    viewState,
    nodeId: pageNodeId,
    highlightLayout,
    highlightedSlot,
  } = usePageEditorState();

  const pageNode = studioDom.getNode(dom, pageNodeId);
  studioDom.assertIsPage(pageNode);

  const pageNodes: readonly PageOrElementNode[] = React.useMemo(() => {
    return [pageNode, ...studioDom.getDescendants(dom, pageNode)];
  }, [dom, pageNode]);

  const selectedNode = selection && studioDom.getNode(dom, selection);

  // We will use this key to remount the overlay after page load
  const [overlayKey, setOverlayKey] = React.useState(1);
  const editorWindowRef = React.useRef<Window>();

  const getViewCoordinates = React.useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const rootElm = editorWindowRef.current?.document.getElementById('root');
      if (!rootElm) {
        return null;
      }
      const rect = rootElm.getBoundingClientRect();
      if (rectContainsPoint(rect, clientX, clientY)) {
        return { x: clientX - rect.x, y: clientY - rect.y };
      }
      return null;
    },
    [],
  );

  const slots: ViewSlots = React.useMemo(() => {
    const result: ViewSlots = {};
    pageNodes.forEach((node) => {
      result[node.id] = calculateNodeSlots(node, studioDom.getChildNodes(dom, node), viewState);
    });
    return result;
  }, [pageNodes, dom, viewState]);

  const availableNodes = React.useMemo(() => {
    /**
     * Return all nodes that are available for insertion.
     * i.e. Exclude all descendants of the current selection since inserting in one of
     * them would create a cyclic structure.
     */
    const excludedNodes = new Set<studioDom.StudioNode>(
      selectedNode ? [selectedNode, ...studioDom.getDescendants(dom, selectedNode)] : [],
    );
    return pageNodes.filter((node) => !excludedNodes.has(node));
  }, [dom, pageNodes, selectedNode]);

  const handleDragStart = React.useCallback(
    (event: React.DragEvent<Element>) => {
      const cursorPos = getViewCoordinates(event.clientX, event.clientY);

      if (!cursorPos) {
        return;
      }

      event.dataTransfer.dropEffect = 'move';

      const nodeId = findNodeAt(pageNodes, viewState, cursorPos.x, cursorPos.y);

      if (nodeId) {
        api.select(nodeId);
      }
    },
    [api, pageNodes, viewState, getViewCoordinates],
  );

  const handleDragOver = React.useCallback(
    (event: React.DragEvent<Element>) => {
      const cursorPos = getViewCoordinates(event.clientX, event.clientY);

      if (!cursorPos) {
        return;
      }

      const slotIndex = findActiveSlotAt(
        availableNodes,
        viewState,
        slots,
        cursorPos.x,
        cursorPos.y,
      );

      const activeSlot = slotIndex;

      event.preventDefault();
      if (activeSlot) {
        api.pageEditor.nodeDragOver(activeSlot);
      } else {
        api.pageEditor.nodeDragOver(null);
      }
    },
    [availableNodes, viewState, api, slots, getViewCoordinates],
  );

  const handleDragLeave = React.useCallback(() => api.pageEditor.nodeDragOver(null), [api]);

  const handleDrop = React.useCallback(
    (event: React.DragEvent<Element>) => {
      const cursorPos = getViewCoordinates(event.clientX, event.clientY);

      if (!cursorPos) {
        return;
      }

      const activeSlot = findActiveSlotAt(
        availableNodes,
        viewState,
        slots,
        cursorPos.x,
        cursorPos.y,
      );

      if (activeSlot) {
        if (newNode) {
          domApi.addNode(
            newNode,
            activeSlot.parentId,
            activeSlot.parentProp,
            activeSlot.parentIndex,
          );
        } else if (selection) {
          domApi.moveNode(
            selection,
            activeSlot.parentId,
            activeSlot.parentProp,
            activeSlot.parentIndex,
          );
        }
      }

      api.pageEditor.nodeDragEnd();
    },
    [availableNodes, viewState, domApi, api, slots, newNode, selection, getViewCoordinates],
  );

  const handleDragEnd = React.useCallback(
    (event: DragEvent | React.DragEvent) => {
      event.preventDefault();
      api.pageEditor.nodeDragEnd();
    },
    [api],
  );

  React.useEffect(() => {
    const handleDragOverDefault = (event: DragEvent) => {
      // Make the whole window a drop target to prevent the return animation happening on dragend
      event.preventDefault();
    };
    window.addEventListener('dragover', handleDragOverDefault);
    window.addEventListener('dragend', handleDragEnd);
    return () => {
      window.removeEventListener('dragover', handleDragOverDefault);
      window.removeEventListener('dragend', handleDragEnd);
    };
  }, [handleDragEnd]);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const cursorPos = getViewCoordinates(event.clientX, event.clientY);

      if (!cursorPos) {
        return;
      }

      const newSelectedNodeId = findNodeAt(pageNodes, viewState, cursorPos.x, cursorPos.y);
      api.select(newSelectedNodeId);
    },
    [api, pageNodes, viewState, getViewCoordinates],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (selection && event.key === 'Backspace') {
        domApi.removeNode(selection);
        api.deselect();
      }
    },
    [domApi, api, selection],
  );

  const selectedRect = selectedNode ? viewState[selectedNode.id]?.rect : null;

  const nodesWithInteraction = React.useMemo<Set<NodeId>>(() => {
    if (!selectedNode) {
      return new Set();
    }
    return new Set(
      [...studioDom.getPageAncestors(dom, selectedNode), selectedNode].map((node) => node.id),
    );
  }, [dom, selectedNode]);

  const handleLoad = React.useCallback((frameWindow: Window) => {
    editorWindowRef.current = frameWindow;
    setOverlayKey((key) => key + 1);
  }, []);

  React.useEffect(() => {
    if (editorWindowRef.current) {
      const rootElm = editorWindowRef.current.document.getElementById('root');

      if (!rootElm) {
        throw new Error(`Invariant: Unable to locate Studio App root element`);
      }

      api.pageEditor.pageViewStateUpdate(getViewState(rootElm));

      const observer = new MutationObserver(() => {
        // TODO: Do we need to throttle this?
        api.pageEditor.pageViewStateUpdate(getViewState(rootElm));
      });

      observer.observe(rootElm, {
        attributes: true,
        childList: true,
        subtree: true,
      });

      return () => observer.disconnect();
    }
    return () => {};
  }, [overlayKey, api]);

  return (
    <RenderPanelRoot className={className}>
      <PageView className={classes.view} dom={dom} pageNodeId={pageNodeId} onLoad={handleLoad} />
      <EditorOverlay key={overlayKey} window={editorWindowRef.current}>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
        <OverlayRoot
          className={clsx({
            [overlayClasses.componentDragging]: highlightLayout,
          })}
          // Need this to be able to capture key events
          tabIndex={0}
          // This component has `pointer-events: none`, but we will selectively enable pointer-events
          // for its children. We can still capture the click gobally
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onKeyDown={handleKeyDown}
          onDragEnd={handleDragEnd}
        >
          {pageNodes.map((node) => {
            const nodeLayout = viewState[node.id];
            if (!nodeLayout) {
              return null;
            }

            const showSelected = studioDom.isElement(node) && selectedNode?.id === node.id;

            return (
              <React.Fragment key={node.id}>
                <div
                  draggable
                  onDragStart={handleDragStart}
                  style={absolutePositionCss(nodeLayout.rect)}
                  className={clsx(overlayClasses.nodeHud, {
                    [overlayClasses.selected]: showSelected,
                    [overlayClasses.allowNodeInteraction]: nodesWithInteraction.has(node.id),
                  })}
                >
                  <div className={overlayClasses.selectionHint}>
                    {studioDom.isElement(node) ? node.component : ''}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          {(Object.entries(slots) as ExactEntriesOf<ViewSlots>).map(([nodeId, nodeSlots = {}]) => {
            return (Object.entries(nodeSlots) as ExactEntriesOf<NodeSlots>).map(
              ([parentProp, namedSlots = []]) => {
                return namedSlots.map((slot: RenderedSlot) =>
                  slot.type === 'multiple' ? (
                    <div
                      key={`${nodeId}:${slot.parentIndex}`}
                      style={insertSlotAbsolutePositionCss(slot)}
                      className={clsx(overlayClasses.insertSlotHud, {
                        [overlayClasses.active]:
                          highlightedSlot?.parentId === nodeId &&
                          highlightedSlot?.parentProp === parentProp &&
                          highlightedSlot?.parentIndex === slot.parentIndex,
                      })}
                    />
                  ) : (
                    <div
                      key={`${nodeId}:${slot.parentIndex}`}
                      style={absolutePositionCss(slot.rect)}
                      className={clsx(overlayClasses.slotHud, {
                        [overlayClasses.active]:
                          highlightedSlot?.parentId === nodeId &&
                          highlightedSlot?.parentProp === parentProp,
                      })}
                    >
                      Insert Here
                    </div>
                  ),
                );
              },
            );
          })}
          {/* 
            This overlay allows passing through pointer-events through a pinhole
            This allows interactivity on the selected element only, while maintaining
            a reliable click target for the rest of the page
          */}
          <PinholeOverlay className={overlayClasses.hudOverlay} pinhole={selectedRect} />
        </OverlayRoot>
      </EditorOverlay>
    </RenderPanelRoot>
  );
}
