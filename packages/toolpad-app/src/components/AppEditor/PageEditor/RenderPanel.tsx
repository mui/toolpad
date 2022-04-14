import * as React from 'react';
import clsx from 'clsx';
import throttle from 'lodash/throttle';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, styled } from '@mui/material';
import { RuntimeEvent, SlotType } from '@mui/toolpad-core';
import {
  NodeId,
  FlowDirection,
  SlotLocation,
  SlotState,
  NodeInfo,
  NodesInfo,
} from '../../../types';
import * as appDom from '../../../appDom';
import PageView from './EditorCanvasHost';
// import PageView from '../../PageView';
import {
  absolutePositionCss,
  distanceToLine,
  distanceToRect,
  Rectangle,
  rectContainsPoint,
} from '../../../utils/geometry';
import { PinholeOverlay } from '../../../PinholeOverlay';
import { getPageViewState } from '../../../pageViewState';
import { ExactEntriesOf } from '../../../utils/types';
import { useDom, useDomApi } from '../../DomLoader';
import { usePageEditorApi, usePageEditorState } from './PageEditorProvider';
import EditorOverlay from './EditorOverlay';
import { HTML_ID_APP_ROOT } from '../../../constants';
import { useToolpadComponent } from '../toolpadComponents';

const ROW_COMPONENT = 'PageRow';

type SlotDirection = 'horizontal' | 'vertical';

const classes = {
  view: 'Toolpad_View',
};

const RenderPanelRoot = styled('div')({
  position: 'relative',
  overflow: 'hidden',

  [`& .${classes.view}`]: {
    height: '100%',
  },
});

const overlayClasses = {
  hud: 'Toolpad_Hud',
  nodeHud: 'Toolpad_NodeHud',
  slotHud: 'Toolpad_SlotHud',
  insertSlotHud: 'Toolpad_InsertSlotHud',
  selected: 'Toolpad_Selected',
  allowNodeInteraction: 'Toolpad_AllowNodeInteraction',
  active: 'Toolpad_Active',
  available: 'Toolpad_Available',
  componentDragging: 'Toolpad_ComponentDragging',
  selectionHint: 'Toolpad_SelectionHint',
  hudOverlay: 'Toolpad_HudOverlay',
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
    alignItems: 'center',
    right: 0,
    background: 'red',
    color: 'white',
    fontSize: 11,
    padding: `2px 0 2px 8px`,
    // TODO: figure out positioning of this selectionhint, it should
    //   - prefer top right, above the component
    //   - if that appears out of bound of the editor, show it bottom or left
    zIndex: 1,
    transform: `translate(0, -100%)`,
  },

  [`& .${overlayClasses.nodeHud}`]: {
    // capture mouse events
    pointerEvents: 'initial',
    position: 'absolute',
    [`&.${overlayClasses.selected}`]: {
      border: '1px solid red',
      [`& .${overlayClasses.selectionHint}`]: {
        display: 'flex',
      },
    },
    [`&.${overlayClasses.allowNodeInteraction}`]: {
      // block pointer-events so we can interact with the selection
      pointerEvents: 'none',
    },
  },

  [`& .${overlayClasses.insertSlotHud}`]: {
    position: 'absolute',

    [`&.${overlayClasses.available}`]: {
      border: '1px dashed #DDD',
    },

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
  nodes: readonly appDom.AppDomNode[],
  nodesInfo: NodesInfo,
  x: number,
  y: number,
): NodeId | null {
  // Search deepest nested first
  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    const node = nodes[i];
    const nodeInfo = nodesInfo[node.id];
    if (nodeInfo?.rect && rectContainsPoint(nodeInfo.rect, x, y)) {
      return node.id;
    }
  }
  return null;
}

/**
 * From a collection of slots, returns the location of the closest one to a certain point
 */
function findClosestSlot(slots: RenderedSlot[], x: number, y: number): SlotLocation | null {
  let closestDistance = Infinity;
  let closestSlot: RenderedSlot | null = null;

  // eslint-disable-next-line no-restricted-syntax
  for (const namedSlot of slots) {
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
      return {
        parentId: namedSlot.parentId,
        parentIndex: namedSlot.parentIndex,
        parentProp: namedSlot.parentProp,
      };
    }

    if (distance < closestDistance) {
      closestDistance = distance;
      closestSlot = namedSlot;
    }
  }

  if (closestSlot) {
    return {
      parentId: closestSlot.parentId,
      parentProp: closestSlot.parentProp,
      parentIndex: closestSlot.parentIndex,
    };
  }

  return null;
}

function findActiveSlotAt(
  nodes: readonly appDom.AppDomNode[],
  nodesInfo: NodesInfo,
  slots: ViewSlots,
  x: number,
  y: number,
): SlotLocation | null {
  // Search deepest nested first
  let nodeInfo: NodeInfo | undefined;
  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    const node = nodes[i];
    nodeInfo = nodesInfo[node.id];
    if (nodeInfo?.rect && rectContainsPoint(nodeInfo.rect, x, y)) {
      // Initially only consider slots of the node we're hovering
      const nodeSlots = Object.values(slots[node.id] || {})
        .flat()
        .filter(Boolean);
      const slotIndex = findClosestSlot(nodeSlots, x, y);
      if (slotIndex) {
        return slotIndex;
      }
    }
  }

  // One last attempt, as a fallback, we find the closest possible slot
  if (nodeInfo) {
    const allSlots: RenderedSlot[] = Object.values(slots)
      .flatMap((slotState: NodeSlots = {}) => {
        return Object.values(slotState).flat();
      })
      .filter(Boolean);
    return findClosestSlot(allSlots, x, y);
  }

  return null;
}

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
  readonly parentId: NodeId;
  readonly parentProp: string;
  readonly parentIndex: string;
}

interface RenderedSingleSlot extends RenderedSlotBase {
  readonly type: 'single';
  readonly rect: Rectangle;
}

interface RenderedInsertSlot extends RenderedSlotBase {
  readonly type: 'multiple';
  readonly direction: SlotDirection;
  readonly x: number;
  readonly y: number;
  readonly size: number;
}

type RenderedSlot = RenderedInsertSlot | RenderedSingleSlot;

function calculateSlots(
  parentId: NodeId,
  parentProp: string,
  slotState: SlotState,
  children: appDom.AppDomNode[],
  nodesInfo: NodesInfo,
): RenderedSlot[] {
  const rect = slotState.rect;

  if (slotState.type === 'single') {
    return [
      {
        type: 'single',
        parentId,
        parentProp,
        parentIndex: appDom.createFractionalIndex(null, null),
        rect,
      },
    ];
  }

  const slotDirection = getSlotDirection(slotState.direction);

  const size = slotDirection === 'horizontal' ? rect.height : rect.width;

  const boundaries: { start: number; end: number; parentIndex: string }[] = [];

  for (let i = 0; i < children.length; i += 1) {
    const child = children[i];
    const childState = nodesInfo[child.id];

    if (!child.parentIndex) {
      throw new Error(`Invariant: Node "${child.id}" has no parent`);
    }

    if (!childState?.rect) {
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
      parentIndex: appDom.createFractionalIndex(null, first.parentIndex),
    });
    const lastIdx = boundaries.length - 1;
    for (let i = 0; i < lastIdx; i += 1) {
      const prev = boundaries[i];
      const current = boundaries[i + 1];
      offsets.push({
        offset: (prev.end + current.start) / 2,
        parentIndex: appDom.createFractionalIndex(prev.parentIndex, current.parentIndex),
      });
    }
    const last = boundaries[lastIdx];
    offsets.push({
      offset: last.end,
      parentIndex: appDom.createFractionalIndex(last.parentIndex, null),
    });
  }

  return offsets.map(
    ({ offset, parentIndex }) =>
      ({
        type: 'multiple',
        parentId,
        parentProp,
        parentIndex,
        direction: slotDirection,
        x: slotDirection === 'horizontal' ? offset : rect.x,
        y: slotDirection === 'horizontal' ? rect.y : offset,
        size,
      } as const),
  );
}

function calculateNodeSlots(
  parent: appDom.AppDomNode,
  children: appDom.NodeChildren,
  nodesInfo: NodesInfo,
): NodeSlots {
  const parentState = nodesInfo[parent.id];

  if (!parentState?.slots) {
    return {};
  }

  const result: NodeSlots = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const [parentProp, slotState] of Object.entries(parentState.slots)) {
    if (slotState) {
      const namedChildren = children[parentProp] ?? [];
      result[parentProp] = calculateSlots(
        parentState.nodeId,
        parentProp,
        slotState,
        namedChildren,
        nodesInfo,
      );
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

interface SelectionHudProps {
  node: appDom.ElementNode;
  rect: Rectangle;
  selected?: boolean;
  allowInteraction?: boolean;
  onDragStart?: React.DragEventHandler<HTMLElement>;
  onDelete?: React.MouseEventHandler<HTMLButtonElement>;
}

function NodeHud({
  node,
  selected,
  allowInteraction,
  rect,
  onDragStart,
  onDelete,
}: SelectionHudProps) {
  const dom = useDom();
  const component = useToolpadComponent(dom, node.attributes.component.value);

  return (
    <div
      draggable
      data-node-id={node.id}
      onDragStart={onDragStart}
      style={absolutePositionCss(rect)}
      className={clsx(overlayClasses.nodeHud, {
        [overlayClasses.selected]: selected,
        [overlayClasses.allowNodeInteraction]: allowInteraction,
      })}
    >
      <div draggable className={overlayClasses.selectionHint}>
        {component.displayName}
        <DragIndicatorIcon color="inherit" fontSize="small" />
        <IconButton aria-label="Remove element" color="inherit" size="small" onClick={onDelete}>
          <DeleteIcon color="inherit" fontSize="small" />
        </IconButton>
      </div>
    </div>
  );
}

export interface RenderPanelProps {
  className?: string;
}

export default function RenderPanel({ className }: RenderPanelProps) {
  const dom = useDom();
  const domApi = useDomApi();
  const api = usePageEditorApi();
  const {
    appId,
    selection,
    newNode,
    viewState,
    nodeId: pageNodeId,
    highlightLayout,
    highlightedSlot,
  } = usePageEditorState();

  const { nodes: nodesInfo } = viewState;

  const pageNode = appDom.getNode(dom, pageNodeId, 'page');

  const pageNodes = React.useMemo(() => {
    return [pageNode, ...appDom.getDescendants(dom, pageNode)];
  }, [dom, pageNode]);

  const selectedNode = selection && appDom.getNode(dom, selection);

  // We will use this key to remount the overlay after page load
  const [overlayKey, setOverlayKey] = React.useState(1);
  const editorWindowRef = React.useRef<Window>();

  const getViewCoordinates = React.useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const rootElm = editorWindowRef.current?.document.getElementById(HTML_ID_APP_ROOT);
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
      result[node.id] = calculateNodeSlots(node, appDom.getChildNodes(dom, node), nodesInfo);
    });
    return result;
  }, [pageNodes, dom, nodesInfo]);

  const handleDragStart = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.stopPropagation();
      const nodeId = event.currentTarget.dataset.nodeId as NodeId | undefined;

      if (!nodeId) {
        return;
      }

      event.dataTransfer.dropEffect = 'move';
      api.select(nodeId);
    },
    [api],
  );

  const getCurrentlyDraggedNode = React.useCallback((): appDom.ElementNode | null => {
    return newNode || (selection && appDom.getNode(dom, selection, 'element'));
  }, [dom, newNode, selection]);

  const availableDropTargets = React.useMemo((): appDom.AppDomNode[] => {
    const draggedNode = getCurrentlyDraggedNode();

    if (!draggedNode) {
      return [];
    }

    const component = draggedNode.attributes.component.value;
    if (component === ROW_COMPONENT) {
      return [appDom.getNode(dom, pageNodeId, 'page')];
    }

    /**
     * Return all nodes that are available for insertion.
     * i.e. Exclude all descendants of the current selection since inserting in one of
     * them would create a cyclic structure.
     */
    const excludedNodes = selectedNode
      ? new Set<appDom.AppDomNode>([selectedNode, ...appDom.getDescendants(dom, selectedNode)])
      : new Set();
    return pageNodes.filter((n) => !excludedNodes.has(n));
  }, [dom, getCurrentlyDraggedNode, pageNodeId, pageNodes, selectedNode]);

  const availableDropTargetIds = React.useMemo(
    () => new Set(availableDropTargets.map((n) => n.id)),
    [availableDropTargets],
  );

  const handleDragOver = React.useCallback(
    (event: React.DragEvent<Element>) => {
      const cursorPos = getViewCoordinates(event.clientX, event.clientY);

      if (!cursorPos) {
        return;
      }

      const slotIndex = findActiveSlotAt(
        availableDropTargets,
        nodesInfo,
        slots,
        cursorPos.x,
        cursorPos.y,
      );

      const activeSlot = slotIndex;

      event.preventDefault();
      if (activeSlot) {
        api.nodeDragOver(activeSlot);
      } else {
        api.nodeDragOver(null);
      }
    },
    [getViewCoordinates, availableDropTargets, nodesInfo, slots, api],
  );

  const handleDragLeave = React.useCallback(() => api.nodeDragOver(null), [api]);

  const handleDrop = React.useCallback(
    (event: React.DragEvent<Element>) => {
      const draggedNode = getCurrentlyDraggedNode();
      const cursorPos = getViewCoordinates(event.clientX, event.clientY);

      if (!draggedNode || !cursorPos) {
        return;
      }

      let activeSlot = findActiveSlotAt(
        availableDropTargets,
        nodesInfo,
        slots,
        cursorPos.x,
        cursorPos.y,
      );

      if (activeSlot) {
        let parent = appDom.getNode(dom, activeSlot.parentId);

        if (!appDom.isElement(parent) && !appDom.isPage(parent)) {
          throw new Error(`Invalid drop target "${activeSlot.parentId}" of type "${parent.type}"`);
        }

        if (appDom.isPage(parent) && draggedNode.attributes.component.value !== ROW_COMPONENT) {
          // TODO: this logic should probably live in the DomReducer?
          const container = appDom.createElement(dom, ROW_COMPONENT, {});
          domApi.addNode(container, parent, 'children');
          parent = container;
          activeSlot = { parentId: parent.id, parentProp: 'children' };
        }

        if (newNode) {
          if (appDom.isElement(parent)) {
            domApi.addNode(newNode, parent, activeSlot.parentProp, activeSlot.parentIndex);
          } else {
            domApi.addNode(newNode, parent, 'children', activeSlot.parentIndex);
          }
        } else if (selection) {
          domApi.moveNode(
            selection,
            activeSlot.parentId,
            activeSlot.parentProp,
            activeSlot.parentIndex,
          );
        }
      }

      api.nodeDragEnd();
      if (activeSlot && newNode) {
        api.select(newNode.id);
      }
    },
    [
      dom,
      nodesInfo,
      domApi,
      api,
      slots,
      newNode,
      selection,
      getViewCoordinates,
      getCurrentlyDraggedNode,
      availableDropTargets,
    ],
  );

  const handleDragEnd = React.useCallback(
    (event: DragEvent | React.DragEvent) => {
      event.preventDefault();
      api.nodeDragEnd();
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

      const newSelectedNodeId = findNodeAt(pageNodes, nodesInfo, cursorPos.x, cursorPos.y);
      const newSelectedNode = newSelectedNodeId && appDom.getMaybeNode(dom, newSelectedNodeId);
      if (newSelectedNode && appDom.isElement(newSelectedNode)) {
        api.select(newSelectedNodeId);
      } else {
        api.select(null);
      }
    },
    [getViewCoordinates, pageNodes, nodesInfo, dom, api],
  );

  const handleDelete = React.useCallback(
    (nodeId: NodeId) => {
      const toRemove = appDom.getNode(dom, nodeId);
      domApi.removeNode(toRemove.id);
      api.deselect();
    },
    [dom, domApi, api],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (selection && event.key === 'Backspace') {
        handleDelete(selection);
      }
    },
    [selection, handleDelete],
  );
  const selectedRect = selectedNode ? nodesInfo[selectedNode.id]?.rect : null;

  const nodesWithInteraction = React.useMemo<Set<NodeId>>(() => {
    if (!selectedNode) {
      return new Set();
    }
    return new Set(
      [...appDom.getPageAncestors(dom, selectedNode), selectedNode].map((node) => node.id),
    );
  }, [dom, selectedNode]);

  const handleLoad = React.useCallback((frameWindow: Window) => {
    editorWindowRef.current = frameWindow;
    setOverlayKey((key) => key + 1);
  }, []);

  const handleRuntimeEvent = React.useCallback(
    (event: RuntimeEvent) => {
      switch (event.type) {
        case 'propUpdated': {
          const node = appDom.getNode(dom, event.nodeId as NodeId, 'element');
          const actual = node.props?.[event.prop];
          if (actual && actual.type !== 'const') {
            console.warn(`Can't update a non-const prop "${event.prop}" on node "${node.id}"`);
            return;
          }

          const newValue: unknown =
            typeof event.value === 'function' ? event.value(actual?.value) : event.value;

          domApi.setNodeNamespacedProp(node, 'props', event.prop, {
            type: 'const',
            value: newValue,
          });
          return;
        }
        default:
          throw new Error(
            `received unrecognized event "${(event as RuntimeEvent).type}" from editor runtime`,
          );
      }
    },
    [dom, domApi],
  );

  const handleRuntimeEventRef = React.useRef(handleRuntimeEvent);
  React.useEffect(() => {
    handleRuntimeEventRef.current = handleRuntimeEvent;
  }, [handleRuntimeEvent]);

  React.useEffect(() => {
    if (editorWindowRef.current) {
      const editorWindow = editorWindowRef.current;
      const rootElm = editorWindow.document.getElementById(HTML_ID_APP_ROOT);

      if (!rootElm) {
        console.warn(`Invariant: Unable to locate Toolpad App root element`);
        return () => {};
      }

      api.pageViewStateUpdate(getPageViewState(rootElm));

      const handlePageUpdate = throttle(
        () => api.pageViewStateUpdate(getPageViewState(rootElm)),
        250,
        { trailing: true },
      );

      const mutationObserver = new MutationObserver(handlePageUpdate);

      mutationObserver.observe(rootElm, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
      });

      const resizeObserver = new ResizeObserver(handlePageUpdate);

      resizeObserver.observe(rootElm);

      // eslint-disable-next-line no-underscore-dangle
      const queuedEvents = Array.isArray(editorWindow.__TOOLPAD_RUNTIME_EVENT__)
        ? // eslint-disable-next-line no-underscore-dangle
          editorWindow.__TOOLPAD_RUNTIME_EVENT__
        : [];

      queuedEvents.forEach((event) => handleRuntimeEventRef.current(event));

      // eslint-disable-next-line no-underscore-dangle
      editorWindow.__TOOLPAD_RUNTIME_EVENT__ = (event) => handleRuntimeEventRef.current(event);

      return () => {
        handlePageUpdate.cancel();
        mutationObserver.disconnect();
        resizeObserver.disconnect();
        // eslint-disable-next-line no-underscore-dangle
        delete editorWindow.__TOOLPAD_RUNTIME_EVENT__;
      };
    }
    return () => {};
  }, [overlayKey, api]);

  return (
    <RenderPanelRoot className={className}>
      <PageView
        appId={appId}
        editor
        className={classes.view}
        dom={dom}
        pageNodeId={pageNodeId}
        onLoad={handleLoad}
      />
      <EditorOverlay key={overlayKey} window={editorWindowRef.current}>
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
          {(Object.entries(slots) as ExactEntriesOf<ViewSlots>).map(([nodeId, nodeSlots = {}]) => {
            return (Object.entries(nodeSlots) as ExactEntriesOf<NodeSlots>).map(
              ([parentProp, namedSlots = []]) => {
                return namedSlots.map((slot: RenderedSlot) =>
                  slot.type === 'multiple' ? (
                    <div
                      key={`${nodeId}:${slot.parentIndex}`}
                      style={insertSlotAbsolutePositionCss(slot)}
                      className={clsx(overlayClasses.insertSlotHud, {
                        [overlayClasses.available]:
                          highlightLayout && availableDropTargetIds.has(nodeId),
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
                        [overlayClasses.available]:
                          highlightLayout && availableDropTargetIds.has(nodeId),
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
          {pageNodes.map((node) => {
            const nodeLayout = nodesInfo[node.id];
            if (!nodeLayout?.rect) {
              return null;
            }

            return (
              appDom.isElement(node) && (
                <NodeHud
                  key={node.id}
                  node={node}
                  rect={nodeLayout.rect}
                  selected={selectedNode?.id === node.id}
                  allowInteraction={nodesWithInteraction.has(node.id)}
                  onDragStart={handleDragStart}
                  onDelete={() => handleDelete(node.id)}
                />
              )
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
