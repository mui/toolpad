import * as React from 'react';
import clsx from 'clsx';
import throttle from 'lodash-es/throttle';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, styled } from '@mui/material';
import { RuntimeEvent } from '@mui/toolpad-core';
import { setEventHandler } from '@mui/toolpad-core/runtime';
import { FlowDirection, NodeId, NodeInfo, SlotsState, SlotState } from '../../../types';
import * as appDom from '../../../appDom';
import EditorCanvasHost from './EditorCanvasHost';
import {
  absolutePositionCss,
  getRectanglePointEdge,
  Rectangle,
  RectangleEdge,
  rectContainsPoint,
} from '../../../utils/geometry';
import { PinholeOverlay } from '../../../PinholeOverlay';
import { getPageViewState } from '../../../pageViewState';
import { useDom, useDomApi } from '../../DomLoader';
import { DropZone, usePageEditorApi, usePageEditorState } from './PageEditorProvider';
import EditorOverlay from './EditorOverlay';
import { HTML_ID_APP_ROOT } from '../../../constants';
import { useToolpadComponent } from '../toolpadComponents';
import {
  getElementNodeComponentId,
  isPageRow,
  PAGE_COLUMN_COMPONENT_ID,
  PAGE_ROW_COMPONENT_ID,
  isPageLayoutComponent,
  isPageColumn,
} from '../../../toolpadComponents';
import { PAGE_GAP } from '../../../runtime/ToolpadApp';
import { ExactEntriesOf } from '../../../utils/types';

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
  highlightedTop: 'Toolpad_HighlightedTop',
  highlightedRight: 'Toolpad_HighlightedRight',
  highlightedBottom: 'Toolpad_HighlightedBottom',
  highlightedLeft: 'Toolpad_HighlightedLeft',
  highlightedCenter: 'Toolpad_HighlightedCenter',
  selected: 'Toolpad_Selected',
  allowNodeInteraction: 'Toolpad_AllowNodeInteraction',
  container: 'Toolpad_Container',
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
  [`&.${overlayClasses.componentDragging}`]: {
    cursor: 'copy',
  },
  [`.${overlayClasses.selectionHint}`]: {
    // capture mouse events
    pointerEvents: 'initial',
    cursor: 'grab',
    display: 'none',
    position: 'absolute',
    alignItems: 'center',
    right: -1,
    background: 'red',
    color: 'white',
    fontSize: 11,
    padding: `0 0 0 8px`,
    // TODO: figure out positioning of this selectionhint, perhaps it should
    //   - prefer top right, above the component
    //   - if that appears out of bound of the editor, show it bottom or left
    zIndex: 1,
    transform: `translate(0, -100%)`,
  },
  [`.${overlayClasses.hudOverlay}`]: {
    position: 'absolute',
    inset: '0 0 0 0',
  },
});

const NodeHudWrapper = styled('div')({
  // capture mouse events
  pointerEvents: 'initial',
  position: 'absolute',
  [`.${overlayClasses.container}`]: {
    position: 'absolute',
    outline: '1px dotted rgba(255,0,0,.2)',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
  },
  [`.${overlayClasses.selected}`]: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    outline: '1px solid red',
  },
  [`.${overlayClasses.selectionHint}`]: {
    display: 'flex',
  },
  [`&.${overlayClasses.allowNodeInteraction}`]: {
    // block pointer-events so we can interact with the selection
    pointerEvents: 'none',
  },
});

const NodeSlotDropArea = styled('div', {
  shouldForwardProp: (prop) => prop !== 'highlightRelativeRect',
})<{
  highlightRelativeRect?: Partial<Rectangle>;
}>(({ highlightRelativeRect = {} }) => {
  const {
    x: highlightRelativeX = 0,
    y: highlightRelativeY = 0,
    width: highlightWidth = '100%',
    height: highlightHeight = '100%',
  } = highlightRelativeRect;

  return {
    // capture mouse events
    pointerEvents: 'initial',
    position: 'absolute',
    [`&.${overlayClasses.highlightedTop}`]: {
      '&:after': {
        backgroundColor: '#44EB2D',
        content: "''",
        position: 'absolute',
        height: 4,
        width: highlightWidth,
        top: -2,
        left: highlightRelativeX,
      },
    },
    [`&.${overlayClasses.highlightedRight}`]: {
      '&:after': {
        backgroundColor: '#44EB2D',
        content: "''",
        position: 'absolute',
        height: highlightHeight,
        width: 4,
        top: highlightRelativeY,
        right: -2,
      },
    },
    [`&.${overlayClasses.highlightedBottom}`]: {
      '&:after': {
        backgroundColor: '#44EB2D',
        content: "''",
        position: 'absolute',
        height: 4,
        width: highlightWidth,
        bottom: -2,
        left: highlightRelativeX,
      },
    },
    [`&.${overlayClasses.highlightedLeft}`]: {
      '&:after': {
        backgroundColor: '#44EB2D',
        content: "''",
        position: 'absolute',
        height: highlightHeight,
        width: 4,
        left: -2,
        top: highlightRelativeY,
      },
    },
    [`& .${overlayClasses.highlightedCenter}`]: {
      border: '4px solid #44EB2D',
    },
  };
});

const EmptySlot = styled('div')({
  alignItems: 'center',
  border: '1px dashed green',
  color: 'green',
  display: 'flex',
  fontSize: 20,
  justifyContent: 'center',
  position: 'absolute',
  opacity: 0.75,
});

function findDropAreaAt(
  nodes: readonly appDom.AppDomNode[],
  dropAreaRects: Record<NodeId, Record<string, Rectangle>>,
  x: number,
  y: number,
): {
  nodeId: NodeId;
  parentProp: string;
} | null {
  // Search deepest nested first
  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    const node = nodes[i];
    const rectEntries = Object.entries(dropAreaRects[node.id]);

    for (let j = 0; j < rectEntries.length; i += 1) {
      const rectEntry = rectEntries[j];

      const rectProp = rectEntry[0];
      const rect = rectEntry[1];
      if (rect && rectContainsPoint(rect, x, y)) {
        return {
          nodeId: node.id,
          parentProp: rectProp,
        };
      }
    }
  }
  return null;
}

function getRectangleEdgeDropZone(edge: RectangleEdge | null): DropZone | null {
  switch (edge) {
    case RectangleEdge.TOP:
      return DropZone.TOP;
    case RectangleEdge.RIGHT:
      return DropZone.RIGHT;
    case RectangleEdge.BOTTOM:
      return DropZone.BOTTOM;
    case RectangleEdge.LEFT:
      return DropZone.LEFT;
    default:
      return null;
  }
}

function getHighlightedZoneOverlayClass(
  highlightedZone: DropZone,
): typeof overlayClasses[keyof typeof overlayClasses] | null {
  switch (highlightedZone) {
    case DropZone.TOP:
      return overlayClasses.highlightedTop;
    case DropZone.RIGHT:
      return overlayClasses.highlightedRight;
    case DropZone.BOTTOM:
      return overlayClasses.highlightedBottom;
    case DropZone.LEFT:
      return overlayClasses.highlightedLeft;
    case DropZone.CENTER:
      return overlayClasses.highlightedCenter;
    default:
      return null;
  }
}

function getChildNodeHighlightedZone(parentFlowDirection: FlowDirection): DropZone | null {
  switch (parentFlowDirection) {
    case 'row':
      return DropZone.RIGHT;
    case 'column':
      return DropZone.BOTTOM;
    case 'row-reverse':
      return DropZone.LEFT;
    case 'column-reverse':
      return DropZone.TOP;
    default:
      return null;
  }
}

function isContainerNode(nodeInfo: NodeInfo): boolean {
  return Object.keys(nodeInfo.slots || []).length > 0;
}

function isHorizontalSlot(slot: SlotState): boolean {
  return slot.flowDirection === 'row' || slot.flowDirection === 'row-reverse';
}

function isVerticalSlot(slot: SlotState): boolean {
  return slot.flowDirection === 'column' || slot.flowDirection === 'column-reverse';
}

interface NodeHudProps {
  node: appDom.ElementNode | appDom.PageNode;
  rect: Rectangle;
  isContainer: boolean;
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
  isContainer,
  onDragStart,
  onDelete,
}: NodeHudProps) {
  const dom = useDom();

  const componentId = appDom.isElement(node) ? getElementNodeComponentId(node) : '';
  const component = useToolpadComponent(dom, componentId);

  return (
    <NodeHudWrapper
      draggable
      data-node-id={node.id}
      onDragStart={onDragStart}
      style={absolutePositionCss(rect)}
      className={clsx({
        [overlayClasses.allowNodeInteraction]: allowInteraction,
      })}
    >
      {isContainer ? <span className={overlayClasses.container} /> : null}
      {selected ? (
        <React.Fragment>
          <span className={overlayClasses.selected} />
          <div draggable className={overlayClasses.selectionHint}>
            {component?.displayName || '<unknown>'}
            <DragIndicatorIcon color="inherit" />
            <IconButton aria-label="Remove element" color="inherit" onClick={onDelete}>
              <DeleteIcon color="inherit" />
            </IconButton>
          </div>
        </React.Fragment>
      ) : null}
    </NodeHudWrapper>
  );
}

interface NodeSlotProps {
  slot: SlotState;
  parentRect: Rectangle | null;
  dropAreaRect: Rectangle;
  highlightedZone?: DropZone | null;
  isEmpty: boolean;
}

function NodeSlot({ slot, highlightedZone, parentRect, dropAreaRect, isEmpty }: NodeSlotProps) {
  const highlightedZoneOverlayClass =
    highlightedZone && getHighlightedZoneOverlayClass(highlightedZone);

  const isHorizontalContainerChild = isHorizontalSlot(slot);
  const isVerticalContainerChild = isVerticalSlot(slot);

  const highlightHeight = isHorizontalContainerChild && parentRect ? parentRect.height : undefined;
  const highlightWidth = isVerticalContainerChild && parentRect ? parentRect.width : undefined;

  const highlightRelativeX =
    highlightWidth && parentRect ? parentRect.x - dropAreaRect.x : undefined;
  const highlightRelativeY =
    highlightHeight && parentRect ? parentRect.y - dropAreaRect.y : undefined;

  return (
    <React.Fragment>
      {isEmpty ? <EmptySlot style={absolutePositionCss(slot.rect)}>+</EmptySlot> : null}
      <NodeSlotDropArea
        style={absolutePositionCss(dropAreaRect)}
        className={clsx(
          highlightedZoneOverlayClass
            ? {
                [highlightedZoneOverlayClass]: true,
              }
            : {},
        )}
        highlightRelativeRect={{
          x: highlightRelativeX,
          y: highlightRelativeY,
          width: highlightWidth,
          height: highlightHeight,
        }}
      />
    </React.Fragment>
  );
}

const GAP_UNIT_IN_PX = 4;

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
    dragOverNodeId,
    dragOverSlotParentProp,
    dragOverZone,
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

    // If dragging row, can place only based on page or other page rows
    if (isPageRow(draggedNode)) {
      return [pageNode, ...pageNodes.filter((node) => appDom.isElement(node) && isPageRow(node))];
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
  }, [dom, getCurrentlyDraggedNode, pageNode, pageNodes, selectedNode]);

  const availableDropTargetIds = React.useMemo(
    () => new Set(availableDropTargets.map((n) => n.id)),
    [availableDropTargets],
  );

  const availableDropZones = React.useMemo((): DropZone[] => {
    const draggedNode = getCurrentlyDraggedNode();

    const dragOverNode = dragOverNodeId && appDom.getNode(dom, dragOverNodeId);
    const dragOverNodeInfo = dragOverNodeId && nodesInfo[dragOverNodeId];

    if (draggedNode && dragOverNode) {
      if (appDom.isPage(dragOverNode)) {
        return [DropZone.CENTER];
      }

      const dragOverNodeSlots = dragOverNodeInfo?.slots;
      const dragOverSlot =
        dragOverNodeSlots && dragOverSlotParentProp && dragOverNodeSlots[dragOverSlotParentProp];

      if (dragOverSlot && isHorizontalSlot(dragOverSlot)) {
        return [
          DropZone.TOP,
          DropZone.BOTTOM,
          ...(isPageRow(draggedNode) ? [] : [DropZone.CENTER]),
        ];
      }
    }

    return [DropZone.TOP, DropZone.RIGHT, DropZone.BOTTOM, DropZone.LEFT, DropZone.CENTER];
  }, [dom, dragOverNodeId, dragOverSlotParentProp, getCurrentlyDraggedNode, nodesInfo]);

  const dropAreaRects = React.useMemo(() => {
    const rects: Record<NodeId, Record<string, Rectangle>> = {};

    pageNodes.forEach((node) => {
      const nodeId = node.id;
      const nodeInfo = nodesInfo[nodeId];

      const nodeSlots = nodeInfo?.slots || [];

      rects[nodeId] = {};

      Object.entries(nodeSlots).forEach(([parentProp, slot]) => {
        if (slot) {
          const parent = appDom.getParent(dom, node);
          const parentInfo = parent && nodesInfo[parent.id];

          let parentAwareNodeRect = null;

          if (
            nodeInfo &&
            parentInfo &&
            (appDom.isPage(parent) || appDom.isElement(parent)) &&
            isContainerNode(parentInfo)
          ) {
            const parentChildren = appDom.getChildNodes(dom, parent)[parentProp] || [];

            const parentChildrenCount = parentChildren.length;

            const isFirstChild = parentChildrenCount > 0 ? parentChildren[0].id === node.id : true;
            const isLastChild =
              parentChildren.length > 0
                ? parentChildren[parentChildrenCount - 1].id === node.id
                : true;

            const parentGapInPx: number = appDom.isPage(parent)
              ? PAGE_GAP * GAP_UNIT_IN_PX
              : (parentInfo.props.gap as number) * GAP_UNIT_IN_PX || 0;

            let gapCount = 2;
            if (isFirstChild || isLastChild) {
              gapCount = 1;
            }
            if (isFirstChild && isLastChild) {
              gapCount = 0;
            }

            const parentSlots = parentInfo?.slots;
            const parentSlot = (parentSlots && parentSlots[node.parentProp || 'children']) || null;

            if (parentSlot && isVerticalSlot(parentSlot)) {
              parentAwareNodeRect = {
                ...slot.rect,
                y: isFirstChild ? slot.rect.y : slot.rect.y - parentGapInPx,
                height: slot.rect.height + gapCount * parentGapInPx,
              };
            }
            if (parentSlot && isHorizontalSlot(parentSlot)) {
              parentAwareNodeRect = {
                ...slot.rect,
                x: isFirstChild ? slot.rect.x : slot.rect.x - parentGapInPx,
                width: slot.rect.width + gapCount * parentGapInPx,
              };
            }

            if (parentAwareNodeRect) {
              rects[nodeId][parentProp] = parentAwareNodeRect;
            }
          } else {
            rects[nodeId][parentProp] = slot.rect;
          }
        }
      });
    });

    return rects;
  }, [dom, nodesInfo, pageNodes]);

  const handleDragOver = React.useCallback(
    (event: React.DragEvent<Element>) => {
      const cursorPos = getViewCoordinates(event.clientX, event.clientY);

      if (!cursorPos) {
        return;
      }

      const activeDropArea = findDropAreaAt(
        availableDropTargets,
        dropAreaRects,
        cursorPos.x,
        cursorPos.y,
      );

      const activeDropNodeId = activeDropArea?.nodeId || pageNode.id;
      const activeDropParentProp = activeDropArea?.parentProp || 'children';

      event.preventDefault();

      const activeDropNode = appDom.getNode(dom, activeDropNodeId);

      let activeDropZone = null;
      const activeDropNodeRect = dropAreaRects[activeDropNodeId][activeDropParentProp];
      const activeDropNodeInfo = nodesInfo[activeDropNodeId];

      const activeDropNodeSlots = activeDropNodeInfo?.slots || null;
      const activeDropSlot = activeDropNodeSlots && activeDropNodeSlots[activeDropParentProp];

      const isDraggingOverPage = appDom.isPage(activeDropNode);
      const isDraggingOverElement = appDom.isElement(activeDropNode);

      const activeDropNodeChildren =
        ((isDraggingOverPage || appDom.isElement(activeDropNode)) &&
          appDom.getChildNodes(dom, activeDropNode)[activeDropParentProp]) ||
        [];

      const isDraggingOverEmptyContainer = activeDropNodeInfo
        ? isContainerNode(activeDropNodeInfo) && activeDropNodeChildren.length === 0
        : false;

      if (activeDropNodeRect) {
        const relativeX = cursorPos.x - activeDropNodeRect.x;
        const relativeY = cursorPos.y - activeDropNodeRect.y;

        activeDropZone =
          isDraggingOverPage || isDraggingOverEmptyContainer
            ? DropZone.CENTER
            : getRectangleEdgeDropZone(
                getRectanglePointEdge(activeDropNodeRect, relativeX, relativeY),
              );

        // Detect center in horizontal containers
        if (isDraggingOverElement && activeDropNodeInfo && isHorizontalSlot(activeDropSlot)) {
          const fractionalY = relativeY / activeDropNodeRect.height;

          if (fractionalY > 0.2 && fractionalY < 0.8) {
            activeDropZone = DropZone.CENTER;
          }
        }
      }

      const hasChangedDropArea =
        activeDropNodeId !== dragOverNodeId ||
        activeDropParentProp !== dragOverSlotParentProp ||
        activeDropZone !== dragOverZone;

      if (activeDropZone && hasChangedDropArea && availableDropTargetIds.has(activeDropNodeId)) {
        api.nodeDragOver({
          nodeId: activeDropNodeId,
          parentProp: activeDropParentProp,
          zone: activeDropZone,
        });
      }
    },
    [
      getViewCoordinates,
      availableDropTargets,
      dropAreaRects,
      pageNode.id,
      dom,
      nodesInfo,
      dragOverNodeId,
      dragOverSlotParentProp,
      dragOverZone,
      availableDropTargetIds,
      api,
    ],
  );

  const getNodeSlotLastChild = React.useCallback(
    (node: appDom.PageNode | appDom.ElementNode, parentProp: string): appDom.ElementNode | null => {
      const nodeChildren = appDom.getChildNodes(dom, node)[parentProp] || [];
      return nodeChildren.length > 0 ? nodeChildren[nodeChildren.length - 1] : null;
    },
    [dom],
  );

  const getNodeSlotHighlightedZone = React.useCallback(
    (node: appDom.AppDomNode, parentProp: string): DropZone | null => {
      const parent = appDom.getParent(dom, node);
      const parentNodeInfo = parent && nodesInfo[parent.id];

      if (dragOverZone && !availableDropZones.includes(dragOverZone)) {
        return null;
      }

      if (dragOverZone === DropZone.CENTER) {
        if (node.id !== dragOverNodeId) {
          // Is dragging over parent element center
          if (parent && parent.id === dragOverNodeId) {
            const nodeParentProp = node.parentProp || 'children';

            const parentLastChild =
              appDom.isPage(parent) || appDom.isElement(parent)
                ? getNodeSlotLastChild(parent, nodeParentProp)
                : null;

            const isParentLastChild = parentLastChild ? node.id === parentLastChild.id : false;

            const parentSlots = parentNodeInfo?.slots || null;

            const parentFlowDirection = parentSlots && parentSlots[nodeParentProp]?.flowDirection;
            return parentFlowDirection && isParentLastChild
              ? getChildNodeHighlightedZone(parentFlowDirection)
              : null;
          }
          return null;
        }
        // Is dragging over slot center

        if (appDom.isPage(node)) {
          return DropZone.CENTER;
        }

        const nodeChildren =
          (appDom.isElement(node) && appDom.getChildNodes(dom, node)[parentProp]) || [];
        return nodeChildren.length === 0 ? DropZone.CENTER : null;
      }

      return node.id === dragOverNodeId ? dragOverZone : null;
    },
    [availableDropZones, dom, dragOverNodeId, dragOverZone, getNodeSlotLastChild, nodesInfo],
  );

  const handleDragLeave = React.useCallback(
    () => api.nodeDragOver({ nodeId: null, parentProp: null, zone: null }),
    [api],
  );

  const deleteOrphanedLayoutComponents = React.useCallback(
    (movedOrDeletedNode: appDom.ElementNode, moveTargetNodeId: NodeId | null = null) => {
      const parent = appDom.getParent(dom, movedOrDeletedNode);
      const parentParent = parent && appDom.getParent(dom, parent);

      const parentChildren = parent
        ? appDom.getChildNodes(dom, parent)[movedOrDeletedNode.parentProp || 'children']
        : [];

      const isSecondLastLayoutContainerChild =
        parent &&
        appDom.isElement(parent) &&
        (isPageRow(parent) || isPageColumn(parent)) &&
        parentChildren.length === 2;

      if (isSecondLastLayoutContainerChild) {
        if (parent.parentIndex && parentParent && appDom.isElement(parentParent)) {
          const lastContainerChild = parentChildren.filter(
            (child) => child.id !== movedOrDeletedNode.id,
          )[0];

          domApi.moveNode(
            lastContainerChild,
            parentParent,
            lastContainerChild.parentProp,
            parent.parentIndex,
          );
          domApi.removeNode(parent.id);
        }
      }

      const isOnlyLayoutContainerChild =
        parent &&
        appDom.isElement(parent) &&
        isPageLayoutComponent(parent) &&
        parentChildren.length === 1;

      if (isOnlyLayoutContainerChild) {
        const isParentOnlyRowColumn =
          parentParent &&
          appDom.isElement(parentParent) &&
          isPageRow(parentParent) &&
          appDom.getChildNodes(dom, parentParent)[parent.parentProp || 'children'].length === 1;

        domApi.removeNode(parent.id);

        if (isParentOnlyRowColumn && moveTargetNodeId !== parentParent.id) {
          domApi.removeNode(parentParent.id);
        }
      }
    },
    [dom, domApi],
  );

  const handleDrop = React.useCallback(
    (event: React.DragEvent<Element>) => {
      const draggedNode = getCurrentlyDraggedNode();
      const cursorPos = getViewCoordinates(event.clientX, event.clientY);

      if (
        !draggedNode ||
        !cursorPos ||
        !dragOverNodeId ||
        !dragOverSlotParentProp ||
        !dragOverZone
      ) {
        return;
      }

      const dragOverNode = appDom.getNode(dom, dragOverNodeId);
      const dragOverNodeInfo = nodesInfo[dragOverNodeId];

      const dragOverNodeParentProp = dragOverNode?.parentProp || 'children';

      const dragOverNodeSlots = dragOverNodeInfo?.slots || null;
      const dragOverSlot = (dragOverNodeSlots && dragOverNodeSlots[dragOverSlotParentProp]) || null;

      if (!appDom.isElement(dragOverNode) && !appDom.isPage(dragOverNode)) {
        return;
      }

      let parent = appDom.getParent(dom, dragOverNode);
      const originalParent = parent;
      const originalParentInfo = parent && nodesInfo[parent.id];

      const originalParentSlots = originalParentInfo?.slots || null;
      const originalParentSlot =
        (originalParentSlots && originalParentSlots[dragOverNodeParentProp]) || null;

      const isDraggingOverPage = (dragOverNode && appDom.isPage(dragOverNode)) || false;

      let addOrMoveNode = domApi.addNode;
      if (selection) {
        addOrMoveNode = domApi.moveNode;
      }

      // Drop on page
      if (isDraggingOverPage) {
        if (!isPageRow(draggedNode)) {
          const rowContainer = appDom.createElement(dom, PAGE_ROW_COMPONENT_ID, {});
          domApi.addNode(rowContainer, dragOverNode, dragOverSlotParentProp);
          parent = rowContainer;

          addOrMoveNode(draggedNode, rowContainer, 'children');
        } else {
          addOrMoveNode(draggedNode, dragOverNode, dragOverSlotParentProp);
        }
      }

      if (parent && !appDom.isElement(parent) && !appDom.isPage(parent)) {
        return;
      }

      if (!isDraggingOverPage && parent) {
        const isOriginalParentPage = originalParent ? appDom.isPage(originalParent) : false;

        if (!isOriginalParentPage && !appDom.isElement(parent)) {
          throw new Error(`Invalid drop target "${parent.id}" of type "${parent.type}"`);
        }

        // Ignore invalid drop zones
        if (!availableDropZones.includes(dragOverZone)) {
          return;
        }

        const isDraggingOverRow = appDom.isElement(dragOverNode) && isPageRow(dragOverNode);
        const isDraggingOverVerticalContainer = dragOverSlot ? isVerticalSlot(dragOverSlot) : false;

        if (dragOverZone === DropZone.CENTER) {
          addOrMoveNode(draggedNode, dragOverNode, dragOverSlotParentProp);
        }

        const isOriginalParentHorizontalContainer = originalParentInfo
          ? isHorizontalSlot(originalParentSlot)
          : false;

        if ([DropZone.TOP, DropZone.BOTTOM].includes(dragOverZone)) {
          if (!isDraggingOverVerticalContainer) {
            const newParentIndex =
              dragOverZone === DropZone.TOP
                ? appDom.getNewParentIndexBeforeNode(dom, dragOverNode, dragOverSlotParentProp)
                : appDom.getNewParentIndexAfterNode(dom, dragOverNode, dragOverSlotParentProp);

            if (isDraggingOverRow && !isPageRow(draggedNode)) {
              const rowContainer = appDom.createElement(dom, PAGE_ROW_COMPONENT_ID, {});
              domApi.addNode(rowContainer, parent, dragOverNodeParentProp, newParentIndex);
              parent = rowContainer;

              addOrMoveNode(draggedNode, parent, dragOverNodeParentProp);
            }

            if (isOriginalParentHorizontalContainer) {
              const columnContainer = appDom.createElement(dom, PAGE_COLUMN_COMPONENT_ID, {});
              domApi.addNode(
                columnContainer,
                parent,
                dragOverNodeParentProp,
                appDom.getNewParentIndexAfterNode(dom, dragOverNode, dragOverSlotParentProp),
              );
              parent = columnContainer;

              // Move existing element inside column right away if drag over zone is bottom
              if (dragOverZone === DropZone.BOTTOM) {
                domApi.moveNode(dragOverNode, parent, dragOverNodeParentProp);
              }
            }

            if (!isDraggingOverRow || isPageRow(draggedNode)) {
              addOrMoveNode(draggedNode, parent, dragOverNodeParentProp, newParentIndex);
            }

            // Only move existing element inside column in the end if drag over zone is top
            if (
              isOriginalParentHorizontalContainer &&
              !isDraggingOverVerticalContainer &&
              dragOverZone === DropZone.TOP
            ) {
              domApi.moveNode(dragOverNode, parent, dragOverNodeParentProp);
            }
          }

          if (dragOverNodeInfo && isDraggingOverVerticalContainer) {
            const isDraggingOverDirectionStart =
              dragOverZone ===
              (dragOverSlot?.flowDirection === 'column' ? DropZone.TOP : DropZone.BOTTOM);

            const newParentIndex = isDraggingOverDirectionStart
              ? appDom.getNewFirstParentIndexInNode(dom, dragOverNode, dragOverSlotParentProp)
              : appDom.getNewLastParentIndexInNode(dom, dragOverNode, dragOverSlotParentProp);

            addOrMoveNode(draggedNode, dragOverNode, dragOverSlotParentProp, newParentIndex);
          }
        }

        const isOriginalParentNonPageVerticalContainer =
          !isOriginalParentPage && originalParentInfo ? isVerticalSlot(originalParentSlot) : false;

        if ([DropZone.RIGHT, DropZone.LEFT].includes(dragOverZone)) {
          if (isOriginalParentNonPageVerticalContainer) {
            const rowContainer = appDom.createElement(dom, PAGE_ROW_COMPONENT_ID, {
              justifyContent: appDom.createConst(originalParentInfo?.props.alignItems || 'start'),
            });
            domApi.addNode(
              rowContainer,
              parent,
              dragOverNodeParentProp,
              appDom.getNewParentIndexAfterNode(dom, dragOverNode, dragOverSlotParentProp),
            );
            parent = rowContainer;

            // Move existing element inside stack right away if drag over zone is right
            if (dragOverZone === DropZone.RIGHT) {
              domApi.moveNode(dragOverNode, parent, dragOverNodeParentProp);
            }
          }

          const newParentIndex =
            dragOverZone === DropZone.RIGHT
              ? appDom.getNewParentIndexAfterNode(dom, dragOverNode, dragOverSlotParentProp)
              : appDom.getNewParentIndexBeforeNode(dom, dragOverNode, dragOverSlotParentProp);

          addOrMoveNode(draggedNode, parent, dragOverNodeParentProp, newParentIndex);

          // Only move existing element inside column in the end if drag over zone is left
          if (isOriginalParentNonPageVerticalContainer && dragOverZone === DropZone.LEFT) {
            domApi.moveNode(dragOverNode, parent, dragOverNodeParentProp);
          }
        }
      }

      api.nodeDragEnd();

      if (selection) {
        deleteOrphanedLayoutComponents(draggedNode, dragOverNodeId);
      }

      if (newNode) {
        api.select(newNode.id);
      }
    },
    [
      api,
      availableDropZones,
      deleteOrphanedLayoutComponents,
      dom,
      domApi,
      dragOverNodeId,
      dragOverSlotParentProp,
      dragOverZone,
      getCurrentlyDraggedNode,
      getViewCoordinates,
      newNode,
      nodesInfo,
      selection,
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

      const newSelectedNodeId =
        findDropAreaAt(pageNodes, dropAreaRects, cursorPos.x, cursorPos.y)?.nodeId || null;
      const newSelectedNode = newSelectedNodeId && appDom.getMaybeNode(dom, newSelectedNodeId);
      if (newSelectedNode && appDom.isElement(newSelectedNode)) {
        api.select(newSelectedNodeId);
      } else {
        api.select(null);
      }
    },
    [getViewCoordinates, pageNodes, dropAreaRects, dom, api],
  );

  const handleDelete = React.useCallback(
    (nodeId: NodeId) => {
      const toRemove = appDom.getNode(dom, nodeId);

      domApi.removeNode(toRemove.id);

      if (appDom.isElement(toRemove)) {
        deleteOrphanedLayoutComponents(toRemove);
      }

      api.deselect();
    },
    [dom, domApi, deleteOrphanedLayoutComponents, api],
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

  const handlePageViewStateUpdate = React.useCallback(() => {
    const rootElm = editorWindowRef.current?.document.getElementById(HTML_ID_APP_ROOT);

    if (!rootElm) {
      return;
    }

    api.pageViewStateUpdate(getPageViewState(rootElm));
  }, [api]);

  const [rootElm, setRootElm] = React.useState<HTMLElement | null>();

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
        case 'pageStateUpdated': {
          api.pageStateUpdate(event.pageState);
          return;
        }
        case 'pageBindingsUpdated': {
          api.pageBindingsUpdate(event.bindings);
          return;
        }
        case 'afterRender': {
          const editorWindow = editorWindowRef.current ?? null;
          setRootElm(editorWindow?.document.getElementById(HTML_ID_APP_ROOT));
          return;
        }
        default:
          throw new Error(
            `received unrecognized event "${(event as RuntimeEvent).type}" from editor runtime`,
          );
      }
    },
    [dom, domApi, api],
  );

  const handleRuntimeEventRef = React.useRef(handleRuntimeEvent);
  React.useLayoutEffect(() => {
    handleRuntimeEventRef.current = handleRuntimeEvent;
  }, [handleRuntimeEvent]);

  React.useEffect(() => {
    if (editorWindowRef.current) {
      const editorWindow = editorWindowRef.current;

      const cleanupHandler = setEventHandler(editorWindow, (event) =>
        handleRuntimeEventRef.current(event),
      );

      return cleanupHandler;
    }
    return () => {};
  }, [overlayKey]);

  React.useEffect(() => {
    if (!rootElm) {
      return () => {};
    }

    handlePageViewStateUpdate();
    const handlePageUpdateThrottled = throttle(handlePageViewStateUpdate, 250, {
      trailing: true,
    });

    const mutationObserver = new MutationObserver(handlePageUpdateThrottled);

    mutationObserver.observe(rootElm, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });

    const resizeObserver = new ResizeObserver(handlePageUpdateThrottled);

    resizeObserver.observe(rootElm);
    rootElm.querySelectorAll('*').forEach((elm) => resizeObserver.observe(elm));

    return () => {
      handlePageUpdateThrottled.cancel();
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [overlayKey, handlePageViewStateUpdate, rootElm]);

  return (
    <RenderPanelRoot className={className}>
      <EditorCanvasHost
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
          {pageNodes.map((node) => {
            const nodeInfo = nodesInfo[node.id];

            const parent = appDom.getParent(dom, node);
            const parentInfo = (parent && nodesInfo[parent.id]) || null;

            const slots = nodeInfo?.slots || {};

            const isPageNode = appDom.isPage(node);
            const hasNodeHud = isPageNode || appDom.isElement(node);

            const isContainer = nodeInfo ? isContainerNode(nodeInfo) : false;

            const nodeRect = nodeInfo?.rect || null;
            const parentRect = parentInfo?.rect || null;

            if (!nodeRect || !hasNodeHud) {
              return null;
            }

            return (
              <React.Fragment key={node.id}>
                {!isPageNode ? (
                  <NodeHud
                    node={node}
                    rect={nodeRect}
                    isContainer={isContainer}
                    selected={selectedNode?.id === node.id}
                    allowInteraction={nodesWithInteraction.has(node.id)}
                    onDragStart={handleDragStart}
                    onDelete={() => handleDelete(node.id)}
                  />
                ) : null}
                {(Object.entries(slots) as ExactEntriesOf<SlotsState>).map(([parentProp, slot]) => {
                  const dropAreaRect = dropAreaRects[node.id][parentProp];

                  const childNodes = appDom.getChildNodes(dom, node)[parentProp] || [];
                  const isEmpty = childNodes.length === 0;

                  return slot ? (
                    <NodeSlot
                      key={`${node.id}:${parentProp}`}
                      slot={slot}
                      parentRect={parentRect}
                      dropAreaRect={dropAreaRect}
                      highlightedZone={getNodeSlotHighlightedZone(node, parentProp)}
                      isEmpty={isEmpty}
                    />
                  ) : null;
                })}
              </React.Fragment>
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
