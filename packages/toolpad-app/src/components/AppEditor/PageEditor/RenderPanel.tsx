import * as React from 'react';
import clsx from 'clsx';
import throttle from 'lodash-es/throttle';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, styled } from '@mui/material';
import { setEventHandler } from '@mui/toolpad-core/runtime';
import { RuntimeEvent, NodeId } from '@mui/toolpad-core';
import { FlowDirection, NodeInfo, NodesInfo, SlotsState, SlotState } from '../../../types';
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

const StyledNodeDropArea = styled('div', {
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
    [`&.${overlayClasses.highlightedCenter}`]: {
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

type DropAreaRects = Record<NodeId, Rectangle | Record<string, Rectangle>>;

function hasEmptyNodeSlots(nodeInfo: NodeInfo): boolean {
  return Object.keys(nodeInfo.slots || []).length > 0;
}

function findDropAreaAt(
  nodes: readonly appDom.AppDomNode[],
  nodesInfo: NodesInfo,
  dropAreaRects: DropAreaRects,
  x: number,
  y: number,
): {
  nodeId: NodeId;
  slotParentProp?: string;
} | null {
  // Search deepest nested first
  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    const node = nodes[i];
    const nodeInfo = nodesInfo[node.id];

    if (nodeInfo && hasEmptyNodeSlots(nodeInfo)) {
      const rectEntries = Object.entries(dropAreaRects[node.id]);

      for (let j = 0; j < rectEntries.length; j += 1) {
        const rectEntry = rectEntries[j];

        const rectProp = rectEntry[0];
        const rect = rectEntry[1];
        if (rect && rectContainsPoint(rect, x, y)) {
          return {
            nodeId: node.id,
            slotParentProp: rectProp,
          };
        }
      }
    } else {
      const dropAreaRect = dropAreaRects[node.id] as Rectangle;

      if (dropAreaRect && rectContainsPoint(dropAreaRect, x, y)) {
        return {
          nodeId: node.id,
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

  const handleDelete = React.useCallback(
    (event) => {
      event.stopPropagation();

      if (onDelete) {
        onDelete(event);
      }
    },
    [onDelete],
  );

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
            <IconButton aria-label="Remove element" color="inherit" onClick={handleDelete}>
              <DeleteIcon color="inherit" />
            </IconButton>
          </div>
        </React.Fragment>
      ) : null}
    </NodeHudWrapper>
  );
}

interface NodeSlotProps {
  node: appDom.ElementNode | appDom.PageNode;
  parentInfo: NodeInfo | null;
  nodeRect: Rectangle;
  dropAreaRect: Rectangle;
  highlightedZone?: DropZone | null;
  isEmptyContainer: boolean;
  isPageChild: boolean;
}

function NodeDropArea({
  node,
  highlightedZone,
  parentInfo,
  nodeRect,
  dropAreaRect,
  isEmptyContainer,
  isPageChild,
}: NodeSlotProps) {
  const highlightedZoneOverlayClass =
    highlightedZone && getHighlightedZoneOverlayClass(highlightedZone);

  const nodeParentProp = node.parentProp;

  const parentSlots = parentInfo?.slots;
  const parentSlot = parentSlots && nodeParentProp && parentSlots[nodeParentProp];

  const parentRect = parentInfo?.rect;

  const isHorizontalContainerChild = parentSlot ? isHorizontalSlot(parentSlot) : false;
  const isVerticalContainerChild = parentSlot ? isVerticalSlot(parentSlot) : false;

  const highlightHeight =
    isHorizontalContainerChild && parentRect ? parentRect.height : nodeRect.height;
  const highlightWidth =
    !isPageChild && isVerticalContainerChild && parentRect ? parentRect.width : nodeRect.width;

  const highlightRelativeX =
    (!isPageChild && isVerticalContainerChild && parentRect ? parentRect.x : nodeRect.x) -
    dropAreaRect.x;
  const highlightRelativeY =
    (isHorizontalContainerChild && parentRect ? parentRect.y : nodeRect.y) - dropAreaRect.y;

  const isHighlightingCenter = highlightedZone === DropZone.CENTER;

  return (
    <StyledNodeDropArea
      style={absolutePositionCss(dropAreaRect)}
      className={clsx(
        highlightedZoneOverlayClass
          ? {
              [highlightedZoneOverlayClass]: !isHighlightingCenter || isEmptyContainer,
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

    /**
     * Return all nodes that are available for insertion.
     * i.e. Exclude all descendants of the current selection since inserting in one of
     * them would create a cyclic structure.
     */
    const excludedNodes = selectedNode
      ? new Set<appDom.AppDomNode>([selectedNode, ...appDom.getDescendants(dom, selectedNode)])
      : new Set();

    return pageNodes.filter((n) => !excludedNodes.has(n));
  }, [dom, getCurrentlyDraggedNode, pageNodes, selectedNode]);

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

      const isDraggingPageRow = isPageRow(draggedNode);

      if (isDraggingPageRow) {
        return [DropZone.TOP, DropZone.BOTTOM];
      }

      const dragOverNodeSlots = dragOverNodeInfo?.slots;
      const dragOverSlot =
        dragOverNodeSlots && dragOverSlotParentProp && dragOverNodeSlots[dragOverSlotParentProp];

      if (dragOverSlot && isHorizontalSlot(dragOverSlot)) {
        return [DropZone.TOP, DropZone.BOTTOM, DropZone.CENTER];
      }
      if (dragOverSlot && isVerticalSlot(dragOverSlot)) {
        return [DropZone.RIGHT, DropZone.LEFT, DropZone.CENTER];
      }
    }

    return [DropZone.TOP, DropZone.RIGHT, DropZone.BOTTOM, DropZone.LEFT, DropZone.CENTER];
  }, [dom, dragOverNodeId, dragOverSlotParentProp, getCurrentlyDraggedNode, nodesInfo]);

  const dropAreaRects = React.useMemo(() => {
    const rects: DropAreaRects = {};

    pageNodes.forEach((node) => {
      const nodeId = node.id;
      const nodeInfo = nodesInfo[nodeId];

      const nodeParentProp = node.parentProp;

      const nodeSlots = nodeInfo?.slots || [];
      const nodeSlotValues = Object.values(nodeSlots);

      const hasEmptySlots = nodeSlotValues.length > 0;

      rects[nodeId] = {};

      const baseRects = hasEmptySlots ? nodeSlotValues.map((slot) => slot?.rect) : [nodeInfo?.rect];

      baseRects.forEach((baseRect, baseRectIndex) => {
        const parent = appDom.getParent(dom, node);
        const parentInfo = parent && nodesInfo[parent.id];

        const parentProp = hasEmptySlots ? Object.keys(nodeSlots)[baseRectIndex] : null;

        let parentAwareNodeRect = null;

        const isPageChild = parent ? appDom.isPage(parent) : false;

        if (
          nodeInfo &&
          parentInfo &&
          baseRect &&
          (isPageChild || appDom.isElement(parent)) &&
          hasEmptyNodeSlots(parentInfo)
        ) {
          const parentChildren = nodeParentProp
            ? (appDom.getChildNodes(dom, parent) as appDom.NodeChildren<appDom.ElementNode>)[
                nodeParentProp
              ]
            : [];

          const parentChildrenCount = parentChildren.length;

          const isFirstChild = parentChildrenCount > 0 ? parentChildren[0].id === node.id : true;
          const isLastChild =
            parentChildren.length > 0
              ? parentChildren[parentChildrenCount - 1].id === node.id
              : true;

          const parentGapInPx: number = isPageChild
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
          const parentSlot = (parentSlots && nodeParentProp && parentSlots[nodeParentProp]) || null;

          if (parentSlot && isVerticalSlot(parentSlot)) {
            parentAwareNodeRect = {
              ...baseRect,
              y: isFirstChild ? baseRect.y : baseRect.y - parentGapInPx,
              height: baseRect.height + gapCount * parentGapInPx,
            };
          }
          if (parentSlot && isHorizontalSlot(parentSlot)) {
            parentAwareNodeRect = {
              ...baseRect,
              x: isFirstChild ? baseRect.x : baseRect.x - parentGapInPx,
              width: baseRect.width + gapCount * parentGapInPx,
            };
          }

          if (parentAwareNodeRect) {
            if (parentProp) {
              (rects[nodeId] as Record<string, Rectangle>)[parentProp] = parentAwareNodeRect;
            } else {
              rects[nodeId] = parentAwareNodeRect;
            }
          }
        } else if (parentProp && baseRect) {
          (rects[nodeId] as Record<string, Rectangle>)[parentProp] = baseRect;
        } else if (baseRect) {
          (rects[nodeId] as Rectangle) = baseRect;
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

      event.preventDefault();

      const activeDropArea = findDropAreaAt(
        pageNodes,
        nodesInfo,
        dropAreaRects,
        cursorPos.x,
        cursorPos.y,
      );

      const activeDropNodeId = activeDropArea?.nodeId || pageNode.id;

      const activeDropNodeInfo = nodesInfo[activeDropNodeId];

      const isActiveDropNodeContainer = activeDropNodeInfo
        ? hasEmptyNodeSlots(activeDropNodeInfo)
        : false;

      const activeDropNode = appDom.getNode(dom, activeDropNodeId);

      const isDraggingOverPage = appDom.isPage(activeDropNode);
      const isDraggingOverElement = appDom.isElement(activeDropNode);

      const activeDropSlotParentProp = isDraggingOverPage
        ? 'children'
        : activeDropArea?.slotParentProp;

      let activeDropZone = null;
      const activeDropNodeRect =
        isActiveDropNodeContainer && activeDropSlotParentProp
          ? (dropAreaRects[activeDropNodeId] as Record<string, Rectangle>)[activeDropSlotParentProp]
          : (dropAreaRects[activeDropNodeId] as Rectangle);

      const activeDropNodeSlots = activeDropNodeInfo?.slots || null;
      const activeDropSlot =
        activeDropNodeSlots &&
        activeDropSlotParentProp &&
        activeDropNodeSlots[activeDropSlotParentProp];

      const activeDropNodeChildren =
        (activeDropSlotParentProp &&
          (isDraggingOverPage || appDom.isElement(activeDropNode)) &&
          (appDom.getChildNodes(dom, activeDropNode) as appDom.NodeChildren<appDom.ElementNode>)[
            activeDropSlotParentProp
          ]) ||
        [];

      const isDraggingOverEmptyContainer = activeDropNodeInfo
        ? isActiveDropNodeContainer && activeDropNodeChildren.length === 0
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

        // Detect center in layout containers
        if (isDraggingOverElement && activeDropNodeInfo && activeDropSlot) {
          if (isHorizontalSlot(activeDropSlot)) {
            const fractionalY = relativeY / activeDropNodeRect.height;

            if (fractionalY < 0.2) {
              activeDropZone = DropZone.TOP;
            } else if (fractionalY > 0.8) {
              activeDropZone = DropZone.BOTTOM;
            } else {
              activeDropZone = DropZone.CENTER;
            }
          }
          if (isVerticalSlot(activeDropSlot)) {
            const fractionalX = relativeX / activeDropNodeRect.width;

            if (fractionalX < 0.2) {
              activeDropZone = DropZone.LEFT;
            } else if (fractionalX > 0.8) {
              activeDropZone = DropZone.RIGHT;
            } else {
              activeDropZone = DropZone.CENTER;
            }
          }
        }
      }

      const hasChangedDropArea =
        activeDropNodeId !== dragOverNodeId ||
        activeDropSlotParentProp !== dragOverSlotParentProp ||
        activeDropZone !== dragOverZone;

      if (activeDropZone && hasChangedDropArea && availableDropTargetIds.has(activeDropNodeId)) {
        api.nodeDragOver({
          nodeId: activeDropNodeId,
          parentProp: activeDropSlotParentProp || null,
          zone: activeDropZone,
        });
      }
    },
    [
      getViewCoordinates,
      pageNodes,
      nodesInfo,
      dropAreaRects,
      pageNode.id,
      dom,
      dragOverNodeId,
      dragOverSlotParentProp,
      dragOverZone,
      availableDropTargetIds,
      api,
    ],
  );

  const getNodeSlotLastChild = React.useCallback(
    (node: appDom.PageNode | appDom.ElementNode, parentProp: string): appDom.ElementNode | null => {
      const nodeChildren =
        (appDom.getChildNodes(dom, node) as appDom.NodeChildren<appDom.ElementNode>)[parentProp] ||
        [];
      return nodeChildren.length > 0 ? nodeChildren[nodeChildren.length - 1] : null;
    },
    [dom],
  );

  const getNodeDropAreaHighlightedZone = React.useCallback(
    (node: appDom.AppDomNode, parentProp: string | null = null): DropZone | null => {
      const nodeInfo = nodesInfo[node.id];

      const parent = appDom.getParent(dom, node);
      const parentNodeInfo = parent && nodesInfo[parent.id];

      if (dragOverZone && !availableDropZones.includes(dragOverZone)) {
        return null;
      }

      if (dragOverZone === DropZone.CENTER) {
        if (node.id !== dragOverNodeId) {
          // Is dragging over parent element center
          if (parent && parent.id === dragOverNodeId) {
            const nodeParentProp = node.parentProp;

            const parentLastChild =
              nodeParentProp && (appDom.isPage(parent) || appDom.isElement(parent))
                ? getNodeSlotLastChild(parent, nodeParentProp)
                : null;

            const isParentLastChild = parentLastChild ? node.id === parentLastChild.id : false;

            const nodeSlots = nodeInfo?.slots || null;
            const nodeSlotProps = nodeSlots && Object.keys(nodeSlots);

            const isNodeLastSlot =
              !parentProp ||
              (nodeSlotProps ? nodeSlotProps[nodeSlotProps.length - 1] === parentProp : false);

            const parentSlots = parentNodeInfo?.slots || null;

            const parentFlowDirection =
              parentSlots && nodeParentProp && parentSlots[nodeParentProp]?.flowDirection;

            return parentFlowDirection && isParentLastChild && isNodeLastSlot
              ? getChildNodeHighlightedZone(parentFlowDirection)
              : null;
          }
          return null;
        }
        // Is dragging over slot center

        if (parentProp && parentProp === dragOverSlotParentProp) {
          if (appDom.isPage(node)) {
            return DropZone.CENTER;
          }

          const nodeChildren =
            (parentProp && appDom.isElement(node) && appDom.getChildNodes(dom, node)[parentProp]) ||
            [];
          return nodeChildren.length === 0 ? DropZone.CENTER : null;
        }
      }

      return node.id === dragOverNodeId && parentProp === dragOverSlotParentProp
        ? dragOverZone
        : null;
    },
    [
      availableDropZones,
      dom,
      dragOverNodeId,
      dragOverSlotParentProp,
      dragOverZone,
      getNodeSlotLastChild,
      nodesInfo,
    ],
  );

  const handleDragLeave = React.useCallback(
    () => api.nodeDragOver({ nodeId: null, parentProp: null, zone: null }),
    [api],
  );

  const deleteOrphanedLayoutComponents = React.useCallback(
    (movedOrDeletedNode: appDom.ElementNode, moveTargetNodeId: NodeId | null = null) => {
      const movedOrDeletedNodeParentProp = movedOrDeletedNode.parentProp;

      const parent = appDom.getParent(dom, movedOrDeletedNode);
      const parentParent = parent && appDom.getParent(dom, parent);
      const parentParentParent = parentParent && appDom.getParent(dom, parentParent);

      const parentChildren =
        parent && movedOrDeletedNodeParentProp
          ? (appDom.getChildNodes(dom, parent) as appDom.NodeChildren<appDom.ElementNode>)[
              movedOrDeletedNodeParentProp
            ]
          : [];

      const isOnlyLayoutContainerChild =
        parent &&
        appDom.isElement(parent) &&
        isPageLayoutComponent(parent) &&
        parentChildren.length === 1;

      const isParentOnlyLayoutContainerChild =
        parentParent &&
        parent.parentProp &&
        appDom.isElement(parentParent) &&
        isPageLayoutComponent(parentParent) &&
        appDom.getChildNodes(dom, parentParent)[parent.parentProp].length === 1;

      const isSecondLastLayoutContainerChild =
        parent &&
        appDom.isElement(parent) &&
        (isPageRow(parent) || isPageColumn(parent)) &&
        parentChildren.length === 2;

      const hasNoLayoutContainerSiblings =
        parentChildren.filter(
          (child) =>
            child.id !== movedOrDeletedNode.id && (isPageRow(child) || isPageColumn(child)),
        ).length === 0;

      if (isSecondLastLayoutContainerChild && hasNoLayoutContainerSiblings) {
        if (parent.parentIndex && parentParent && appDom.isElement(parentParent)) {
          const lastContainerChild = parentChildren.filter(
            (child) => child.id !== movedOrDeletedNode.id,
          )[0];

          if (lastContainerChild.parentProp) {
            if (moveTargetNodeId !== parent.id && moveTargetNodeId !== lastContainerChild.id) {
              domApi.moveNode(
                lastContainerChild,
                parentParent,
                lastContainerChild.parentProp,
                parent.parentIndex,
              );
              domApi.removeNode(parent.id);
            }

            if (
              parentParentParent &&
              appDom.isElement(parentParentParent) &&
              isParentOnlyLayoutContainerChild &&
              moveTargetNodeId !== parentParent.id
            ) {
              domApi.moveNode(
                lastContainerChild,
                parentParentParent,
                lastContainerChild.parentProp,
              );
              domApi.removeNode(parentParent.id);
            }
          }
        }
      }

      if (isOnlyLayoutContainerChild) {
        domApi.removeNode(parent.id);

        if (isParentOnlyLayoutContainerChild && moveTargetNodeId !== parentParent.id) {
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

      if (!draggedNode || !cursorPos || !dragOverNodeId || !dragOverZone) {
        return;
      }

      const dragOverNode = appDom.getNode(dom, dragOverNodeId);
      const dragOverNodeInfo = nodesInfo[dragOverNodeId];

      const dragOverNodeParentProp =
        (dragOverNode?.parentProp as appDom.ParentPropOf<
          appDom.ElementNode<any>,
          appDom.PageNode | appDom.ElementNode<any>
        >) || null;

      if (!dragOverNodeParentProp) {
        return;
      }

      const dragOverNodeSlots = dragOverNodeInfo?.slots || null;
      const dragOverSlot =
        (dragOverNodeSlots &&
          dragOverSlotParentProp &&
          dragOverNodeSlots[dragOverSlotParentProp]) ||
        null;

      const isDraggingOverPage = dragOverNode ? appDom.isPage(dragOverNode) : false;
      const isDraggingOverElement = appDom.isElement(dragOverNode);

      if (!appDom.isElement(dragOverNode) && !appDom.isPage(dragOverNode)) {
        return;
      }

      let parent = appDom.getParent(dom, dragOverNode);

      const originalParent = parent;
      const originalParentInfo = parent && nodesInfo[parent.id];

      const originalParentSlots = originalParentInfo?.slots || null;
      const originalParentSlot =
        (originalParentSlots && originalParentSlots[dragOverNodeParentProp]) || null;

      let addOrMoveNode = domApi.addNode;
      if (selection) {
        addOrMoveNode = domApi.moveNode;
      }

      // Drop on page
      if (isDraggingOverPage) {
        if (!isPageRow(draggedNode)) {
          const rowContainer = appDom.createElement(dom, PAGE_ROW_COMPONENT_ID, {});
          domApi.addNode(rowContainer, dragOverNode, 'children');
          parent = rowContainer;

          addOrMoveNode(draggedNode, rowContainer, 'children');
        } else {
          addOrMoveNode(draggedNode, dragOverNode, 'children');
        }
      }

      if (isDraggingOverElement && parent && (appDom.isPage(parent) || appDom.isElement(parent))) {
        if (!availableDropZones.includes(dragOverZone)) {
          return;
        }

        const isOriginalParentPage = originalParent ? appDom.isPage(originalParent) : false;

        const isDraggingOverRow = isDraggingOverElement && isPageRow(dragOverNode);
        const isDraggingOverVerticalContainer = dragOverSlot ? isVerticalSlot(dragOverSlot) : false;

        if (dragOverZone === DropZone.CENTER && dragOverSlotParentProp) {
          addOrMoveNode(draggedNode, dragOverNode, dragOverSlotParentProp);
        }

        const isOriginalParentHorizontalContainer = originalParentSlot
          ? isHorizontalSlot(originalParentSlot)
          : false;

        if ([DropZone.TOP, DropZone.BOTTOM].includes(dragOverZone)) {
          if (!isDraggingOverVerticalContainer) {
            const newParentIndex =
              dragOverZone === DropZone.TOP
                ? appDom.getNewParentIndexBeforeNode(dom, dragOverNode, dragOverNodeParentProp)
                : appDom.getNewParentIndexAfterNode(dom, dragOverNode, dragOverNodeParentProp);

            if (isDraggingOverRow && !isPageRow(draggedNode)) {
              if (isOriginalParentPage) {
                const rowContainer = appDom.createElement(dom, PAGE_ROW_COMPONENT_ID, {});
                domApi.addNode(rowContainer, parent, dragOverNodeParentProp, newParentIndex);
                parent = rowContainer;
              }

              addOrMoveNode(draggedNode, parent, dragOverNodeParentProp);
            }

            if (isOriginalParentHorizontalContainer) {
              const columnContainer = appDom.createElement(dom, PAGE_COLUMN_COMPONENT_ID, {});
              domApi.addNode(
                columnContainer,
                parent,
                dragOverNodeParentProp,
                appDom.getNewParentIndexAfterNode(dom, dragOverNode, dragOverNodeParentProp),
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

          if (dragOverSlotParentProp && isDraggingOverVerticalContainer) {
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
          !isOriginalParentPage && originalParentSlot ? isVerticalSlot(originalParentSlot) : false;

        if ([DropZone.RIGHT, DropZone.LEFT].includes(dragOverZone)) {
          if (isOriginalParentNonPageVerticalContainer) {
            const rowContainer = appDom.createElement(dom, PAGE_ROW_COMPONENT_ID, {
              justifyContent: appDom.createConst(originalParentInfo?.props.alignItems || 'start'),
            });
            domApi.addNode(
              rowContainer,
              parent,
              dragOverNodeParentProp,
              appDom.getNewParentIndexAfterNode(dom, dragOverNode, dragOverNodeParentProp),
            );
            parent = rowContainer;

            // Move existing element inside stack right away if drag over zone is right
            if (dragOverZone === DropZone.RIGHT) {
              domApi.moveNode(dragOverNode, parent, dragOverNodeParentProp);
            }
          }

          const newParentIndex =
            dragOverZone === DropZone.RIGHT
              ? appDom.getNewParentIndexAfterNode(dom, dragOverNode, dragOverNodeParentProp)
              : appDom.getNewParentIndexBeforeNode(dom, dragOverNode, dragOverNodeParentProp);

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
        findDropAreaAt(pageNodes, nodesInfo, dropAreaRects, cursorPos.x, cursorPos.y)?.nodeId ||
        null;
      const newSelectedNode = newSelectedNodeId && appDom.getMaybeNode(dom, newSelectedNodeId);
      if (newSelectedNode && appDom.isElement(newSelectedNode)) {
        api.select(newSelectedNodeId);
      } else {
        api.select(null);
      }
    },
    [getViewCoordinates, pageNodes, nodesInfo, dropAreaRects, dom, api],
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

            const emptySlots = nodeInfo?.slots || {};
            const emptySlotEntries = Object.entries(emptySlots) as ExactEntriesOf<SlotsState>;
            const hasEmptySlots = emptySlotEntries.length > 0;

            const isPageNode = appDom.isPage(node);
            const isPageChild = parent ? appDom.isPage(parent) : false;

            const childNodes = appDom.getChildNodes(
              dom,
              node,
            ) as appDom.NodeChildren<appDom.ElementNode>;

            const isContainer = Object.keys(childNodes).length > 0;

            const nodeRect = nodeInfo?.rect || null;
            const hasNodeOverlay = isPageNode || appDom.isElement(node);

            if (!nodeRect || !hasNodeOverlay) {
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
                {hasEmptySlots ? (
                  emptySlotEntries.map(([parentProp, emptySlot]) => {
                    const dropAreaRect = (dropAreaRects[node.id] as Record<string, Rectangle>)[
                      parentProp
                    ];

                    const slotChildNodes = childNodes[parentProp] || [];
                    const isEmptyContainer = slotChildNodes.length === 0;

                    if (!emptySlot) {
                      return null;
                    }

                    return (
                      <React.Fragment key={`${node.id}:${parentProp}}`}>
                        <NodeDropArea
                          node={node}
                          parentInfo={parentInfo}
                          nodeRect={nodeRect}
                          dropAreaRect={dropAreaRect}
                          highlightedZone={getNodeDropAreaHighlightedZone(node, parentProp)}
                          isEmptyContainer={isEmptyContainer}
                          isPageChild={isPageChild}
                        />
                        {isEmptyContainer ? (
                          <EmptySlot style={absolutePositionCss(emptySlot.rect)}>+</EmptySlot>
                        ) : null}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <NodeDropArea
                    node={node}
                    parentInfo={parentInfo}
                    nodeRect={nodeRect}
                    dropAreaRect={dropAreaRects[node.id] as Rectangle}
                    highlightedZone={getNodeDropAreaHighlightedZone(node)}
                    isEmptyContainer={false}
                    isPageChild={isPageChild}
                  />
                )}
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
