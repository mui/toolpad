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
  StudioBridge,
} from '../../../types';
import * as studioDom from '../../../studioDom';
import PageView, { PageViewHandle } from '../../PageView';
import {
  absolutePositionCss,
  distanceToLine,
  distanceToRect,
  Rectangle,
  rectContainsPoint,
} from '../../../utils/geometry';
import { PinholeOverlay } from '../../../PinholeOverlay';
import { useEditorApi } from '../EditorProvider';
import { ExactEntriesOf } from '../../../utils/types';
import { useDom, useDomApi } from '../../DomProvider';
import { usePageEditorState } from './PageFileEditorProvider';

type SlotDirection = 'horizontal' | 'vertical';

const classes = {
  scrollContainer: 'StudioScrollContainer',
  hud: 'StudioHud',
  view: 'StudioView',
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

const RenderPanelRoot = styled('div')({
  position: 'relative',
  overflow: 'auto',

  [`& .${classes.scrollContainer}`]: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
  },

  [`& .${classes.hud}`]: {
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  [`& .${classes.view}`]: {},

  [`& .${classes.selectionHint}`]: {
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

  [`& .${classes.nodeHud}`]: {
    // capture mouse events
    pointerEvents: 'initial',
    position: 'absolute',
    [`&.${classes.selected}`]: {
      border: '1px solid red',
      [`& .${classes.selectionHint}`]: {
        display: 'block',
      },
    },
    [`&.${classes.allowNodeInteraction}`]: {
      // block pointer-events so we can interact with the selection
      pointerEvents: 'none',
    },
  },

  [`& .${classes.componentDragging}`]: {
    [`& .${classes.insertSlotHud}`]: {
      border: '1px dashed #DDD',
    },
  },

  [`& .${classes.insertSlotHud}`]: {
    position: 'absolute',

    [`&.${classes.active}`]: {
      border: '1px solid green',
    },
  },

  [`& .${classes.slotHud}`]: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    color: 'green',
    border: '1px dashed green',
    opacity: 0.5,
    [`&.${classes.active}`]: {
      border: '1px solid green',
      opacity: 1,
    },
  },

  [`& .${classes.hudOverlay}`]: {
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

  const viewRef = React.useRef<PageViewHandle>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);

  const [isFocused, setIsFocused] = React.useState(false);

  const pageNode = studioDom.getNode(dom, pageNodeId);
  studioDom.assertIsPage(pageNode);

  const getStudioBridge = React.useCallback((): StudioBridge => {
    const studioWindow = viewRef.current?.getRootElm()?.ownerDocument.defaultView;
    // eslint-disable-next-line no-underscore-dangle
    const bridge = studioWindow?.__STUDIO;
    if (!bridge) {
      throw new Error(`Can't connect to bridge`);
    }
    return bridge;
  }, []);

  const pageNodes: readonly PageOrElementNode[] = React.useMemo(() => {
    return [pageNode, ...studioDom.getDescendants(dom, pageNode)];
  }, [dom, pageNode]);

  const selectedNode = selection && studioDom.getNode(dom, selection);

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

  const handleRender = React.useCallback(() => {
    const rootElm = viewRef.current?.getRootElm();
    if (rootElm) {
      api.pageEditor.pageViewStateUpdate(getStudioBridge().getViewState());
    }
  }, [api, getStudioBridge]);

  const getViewCoordinates = React.useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const rootElm = overlayRef.current;
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
    [api, getViewCoordinates, pageNodes, viewState],
  );

  React.useEffect(() => {
    const handleDragOver = (event: DragEvent) => {
      const cursorPos = getViewCoordinates(event.clientX, event.clientY);

      if (!cursorPos) {
        api.pageEditor.nodeDragOver(null);
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
    };

    const handleDrop = (event: DragEvent) => {
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
    };

    const handleDragEnd = (event: DragEvent) => {
      event.preventDefault();
      api.pageEditor.nodeDragEnd();
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragend', handleDragEnd);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragend', handleDragEnd);
    };
  }, [availableNodes, getViewCoordinates, viewState, domApi, api, slots, newNode, selection]);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const cursorPos = getViewCoordinates(event.clientX, event.clientY);

      if (!cursorPos) {
        return;
      }

      const newSelectedNodeId = findNodeAt(pageNodes, viewState, cursorPos.x, cursorPos.y);
      api.select(newSelectedNodeId);
    },
    [api, getViewCoordinates, pageNodes, viewState],
  );

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isFocused && selection && event.key === 'Backspace') {
        domApi.removeNode(selection);
        api.deselect();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [domApi, api, isFocused, selection]);

  const selectedRect = selectedNode ? viewState[selectedNode.id]?.rect : null;

  const nodesWithInteraction = React.useMemo<Set<NodeId>>(() => {
    if (!selectedNode) {
      return new Set();
    }
    return new Set(
      [...studioDom.getPageAncestors(dom, selectedNode), selectedNode].map((node) => node.id),
    );
  }, [dom, selectedNode]);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleFocus = React.useCallback((event: React.FocusEvent<HTMLDivElement>) => {
    if (event.target === rootRef.current) {
      setIsFocused(true);
    }
  }, []);
  const handleBlur = React.useCallback(() => setIsFocused(false), []);
  return (
    <RenderPanelRoot
      ref={rootRef}
      className={className}
      tabIndex={0}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div className={classes.scrollContainer}>
        <PageView
          className={classes.view}
          ref={viewRef}
          dom={dom}
          pageNodeId={pageNodeId}
          onUpdate={handleRender}
        />
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
        <div
          className={clsx(classes.hud, {
            [classes.componentDragging]: highlightLayout,
          })}
          // This component has `pointer-events: none`, but we will slectively enable pointer-events
          // for its children. We can still capture the click gobally
          onClick={handleClick}
        >
          {pageNodes.map((node) => {
            const nodeLayout = viewState[node.id];
            if (!nodeLayout) {
              return null;
            }
            const selectable = studioDom.isElement(node);

            return (
              <React.Fragment key={node.id}>
                <div
                  draggable
                  onDragStart={handleDragStart}
                  style={absolutePositionCss(nodeLayout.rect)}
                  className={clsx(classes.nodeHud, {
                    [classes.selected]: selectedNode?.id === node.id,
                    [classes.allowNodeInteraction]: nodesWithInteraction.has(node.id),
                  })}
                >
                  {selectable ? (
                    <div className={classes.selectionHint}>{node.component}</div>
                  ) : null}
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
                      className={clsx(classes.insertSlotHud, {
                        [classes.active]:
                          highlightedSlot?.parentId === nodeId &&
                          highlightedSlot?.parentProp === parentProp &&
                          highlightedSlot?.parentIndex === slot.parentIndex,
                      })}
                    />
                  ) : (
                    <div
                      key={`${nodeId}:${slot.parentIndex}`}
                      style={absolutePositionCss(slot.rect)}
                      className={clsx(classes.slotHud, {
                        [classes.active]:
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
          <PinholeOverlay
            ref={overlayRef}
            className={classes.hudOverlay}
            onClick={handleClick}
            pinhole={selectedRect}
          />
        </div>
      </div>
    </RenderPanelRoot>
  );
}
