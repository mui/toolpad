import * as React from 'react';
import clsx from 'clsx';
import throttle from 'lodash-es/throttle';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, styled } from '@mui/material';
import { ArgTypeDefinitions, RuntimeEvent } from '@mui/toolpad-core';
import { setEventHandler } from '@mui/toolpad-core/runtime';
import { FlowDirection, NodeId, NodeInfo } from '../../../types';
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
import { usePageEditorApi, usePageEditorState } from './PageEditorProvider';
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
  layout: 'Toolpad_Layout',
  active: 'Toolpad_Active',
  available: 'Toolpad_Available',
  componentDragging: 'Toolpad_ComponentDragging',
  componentDroppable: 'Toolpad_ComponentDroppable',
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
  [`&.${overlayClasses.componentDroppable}`]: {
    cursor: 'copy',
  },
  [`& .${overlayClasses.selectionHint}`]: {
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
  [`& .${overlayClasses.hudOverlay}`]: {
    position: 'absolute',
    inset: '0 0 0 0',
  },
});

const NodeHudWrapper = styled('div')<{
  highlightHeight?: number | string;
  highlightWidth?: number | string;
  highlightTop?: number;
  highlightLeft?: number;
}>(
  ({ highlightHeight = '100%', highlightWidth = '100%', highlightTop = 0, highlightLeft = 0 }) => ({
    // capture mouse events
    pointerEvents: 'initial',
    position: 'absolute',
    [`&.${overlayClasses.layout}`]: {
      outline: '1px dotted rgba(255,0,0,.125)',
    },
    [`&.${overlayClasses.highlightedTop}`]: {
      '&:after': {
        backgroundColor: '#44EB2D',
        content: "''",
        position: 'absolute',
        height: 4,
        width: highlightWidth,
        top: -2,
        left: highlightLeft,
      },
    },
    [`&.${overlayClasses.highlightedRight}`]: {
      '&:after': {
        backgroundColor: '#44EB2D',
        content: "''",
        position: 'absolute',
        height: highlightHeight,
        width: 4,
        top: highlightTop,
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
        left: highlightLeft,
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
        top: highlightTop,
      },
    },
    [`&.${overlayClasses.highlightedCenter}`]: {
      border: '4px solid #44EB2D',
    },
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
  }),
);

const EmptyDropZone = styled('div')({
  alignItems: 'center',
  border: '1px solid green',
  color: 'green',
  display: 'flex',
  fontSize: 20,
  justifyContent: 'center',
  position: 'absolute',
});

function findNodeAt(
  nodes: readonly appDom.AppDomNode[],
  rects: Record<NodeId, Rectangle | null>,
  x: number,
  y: number,
): NodeId | null {
  // Search deepest nested first
  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    const node = nodes[i];
    const rect = rects[node.id];
    if (rect && rectContainsPoint(rect, x, y)) {
      return node.id;
    }
  }
  return null;
}

enum DropZone {
  TOP = 'TOP',
  RIGHT = 'RIGHT',
  BOTTOM = 'BOTTOM',
  LEFT = 'LEFT',
  CENTER = 'CENTER',
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

function getChildNodeHighlightedZone(direction: FlowDirection): DropZone | null {
  switch (direction) {
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

function isContainerComponent(nodeInfo: NodeInfo): boolean {
  const componentArgTypes: ArgTypeDefinitions<any> | undefined = nodeInfo.componentConfig?.argTypes;
  const childrenControlType = componentArgTypes?.children?.control?.type;

  return childrenControlType === 'slot' || childrenControlType === 'slots';
}

function isHorizontalContainer(nodeInfo: NodeInfo): boolean {
  return nodeInfo.direction === 'row' || nodeInfo.direction === 'row-reverse';
}

function isVerticalContainer(nodeInfo: NodeInfo): boolean {
  return nodeInfo.direction === 'column' || nodeInfo.direction === 'column-reverse';
}

interface SelectionHudProps {
  node: appDom.ElementNode | appDom.PageNode;
  parentInfo: NodeInfo | null;
  rect: Rectangle;
  highlightedZone?: DropZone | null;
  selected?: boolean;
  allowInteraction?: boolean;
  onDragStart?: React.DragEventHandler<HTMLElement>;
  onDelete?: React.MouseEventHandler<HTMLButtonElement>;
  hasContainer: boolean;
}

function NodeHud({
  node,
  parentInfo,
  highlightedZone,
  selected,
  allowInteraction,
  rect,
  onDragStart,
  onDelete,
  hasContainer,
}: SelectionHudProps) {
  const dom = useDom();

  const componentId = appDom.isElement(node) ? getElementNodeComponentId(node) : '';
  const component = useToolpadComponent(dom, componentId);

  const highlightedZoneOverlayClass =
    highlightedZone && getHighlightedZoneOverlayClass(highlightedZone);

  let hasEmptyContainer = false;
  if (hasContainer) {
    const childNodes = appDom.getChildNodes(dom, node).children || [];
    hasEmptyContainer = childNodes.length === 0;
  }

  const isContainerChild = parentInfo ? isContainerComponent(parentInfo) : false;
  const isHorizontalContainerChild = parentInfo
    ? isContainerChild && isHorizontalContainer(parentInfo)
    : false;
  const isVerticalContainerChild = parentInfo
    ? isContainerChild && isVerticalContainer(parentInfo)
    : false;

  const highlightHeight =
    isHorizontalContainerChild && parentInfo?.rect ? parentInfo.rect.height : undefined;
  const highlightWidth =
    isVerticalContainerChild && parentInfo?.rect ? parentInfo.rect.width : undefined;

  const highlightTop = highlightHeight && parentInfo?.rect ? parentInfo.rect.y - rect.y : undefined;
  const highlightLeft = highlightWidth && parentInfo?.rect ? parentInfo.rect.x - rect.x : undefined;

  return (
    <React.Fragment>
      {hasEmptyContainer ? (
        <EmptyDropZone style={absolutePositionCss(rect)}>+</EmptyDropZone>
      ) : null}
      <NodeHudWrapper
        draggable
        data-node-id={node.id}
        onDragStart={onDragStart}
        style={absolutePositionCss(rect)}
        className={clsx({
          [overlayClasses.layout]: hasContainer,
          ...(highlightedZoneOverlayClass ? { [highlightedZoneOverlayClass]: true } : {}),
          [overlayClasses.selected]: selected,
          [overlayClasses.allowNodeInteraction]: allowInteraction,
        })}
        highlightHeight={highlightHeight}
        highlightWidth={highlightWidth}
        highlightTop={highlightTop}
        highlightLeft={highlightLeft}
      >
        <div draggable className={overlayClasses.selectionHint}>
          {component?.displayName || '<unknown>'}
          <DragIndicatorIcon color="inherit" />
          <IconButton aria-label="Remove element" color="inherit" onClick={onDelete}>
            <DeleteIcon color="inherit" />
          </IconButton>
        </div>
      </NodeHudWrapper>
    </React.Fragment>
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
    dragOverNodeId,
    dragOverNodeZone,
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

    if (draggedNode && dragOverNode) {
      if (appDom.isPage(dragOverNode)) {
        return [DropZone.CENTER];
      }

      if (appDom.isElement(dragOverNode)) {
        if (isPageRow(dragOverNode)) {
          return [
            DropZone.TOP,
            DropZone.BOTTOM,
            ...(isPageRow(draggedNode) ? [] : [DropZone.CENTER]),
          ];
        }
      }
    }

    return [DropZone.TOP, DropZone.RIGHT, DropZone.BOTTOM, DropZone.LEFT, DropZone.CENTER];
  }, [dom, dragOverNodeId, getCurrentlyDraggedNode]);

  const CONTAINER_GAP_IN_PX = 4;

  const dropAreaRects = React.useMemo(() => {
    const rects: Record<NodeId, Rectangle | null> = {};

    pageNodes.forEach((node) => {
      const nodeInfo = nodesInfo[node.id];

      const parent = appDom.getParent(dom, node);
      const parentInfo = parent && nodesInfo[parent.id];

      let parentAwareNodeRect = null;

      if (
        nodeInfo &&
        parentInfo &&
        (appDom.isPage(parent) || appDom.isElement(parent)) &&
        isContainerComponent(parentInfo)
      ) {
        const parentChildren = appDom.getChildNodes(dom, parent).children || [];

        const isFirstChild = parentChildren.length > 0 ? parentChildren[0].id === node.id : true;
        const isLastChild =
          parentChildren.length > 0
            ? parentChildren[parentChildren.length - 1].id === node.id
            : true;

        const parentGapInPx: number = appDom.isPage(parent)
          ? PAGE_GAP * CONTAINER_GAP_IN_PX
          : (parentInfo.props.gap as number) * CONTAINER_GAP_IN_PX || 0;

        let gapCount = 2;
        if (isFirstChild || isLastChild) {
          gapCount = 1;
        }
        if (isFirstChild && isLastChild) {
          gapCount = 0;
        }

        if (nodeInfo.rect && isVerticalContainer(parentInfo)) {
          parentAwareNodeRect = {
            ...nodeInfo.rect,
            y: isFirstChild ? nodeInfo.rect.y : nodeInfo.rect.y - parentGapInPx,
            height: nodeInfo.rect.height + gapCount * parentGapInPx,
          };
        }
        if (nodeInfo.rect && isHorizontalContainer(parentInfo)) {
          parentAwareNodeRect = {
            ...nodeInfo.rect,
            x: isFirstChild ? nodeInfo.rect.x : nodeInfo.rect.x - parentGapInPx,
            width: nodeInfo.rect.width + gapCount * parentGapInPx,
          };
        }

        rects[node.id] = parentAwareNodeRect;
      } else {
        rects[node.id] = nodeInfo?.rect || null;
      }
    });

    return rects;
  }, [dom, nodesInfo, pageNodes]);

  const handleDragOver = React.useCallback(
    (event: React.DragEvent<Element>) => {
      const cursorPos = getViewCoordinates(event.clientX, event.clientY);

      if (!cursorPos) {
        return;
      }

      const activeDropNodeId = findNodeAt(
        availableDropTargets,
        dropAreaRects,
        cursorPos.x,
        cursorPos.y,
      );

      event.preventDefault();

      const activeDropNode = activeDropNodeId && appDom.getNode(dom, activeDropNodeId);

      let activeDropZone = null;
      if (activeDropNode) {
        const activeDropNodeRect = dropAreaRects[activeDropNodeId];
        const activeDropNodeInfo = nodesInfo[activeDropNodeId];

        const isDraggingOverPage = appDom.isPage(activeDropNode);
        const isDraggingOverElement = appDom.isElement(activeDropNode);

        const activeDropNodeChildren =
          (activeDropNode &&
            (isDraggingOverPage || appDom.isElement(activeDropNode)) &&
            appDom.getChildNodes(dom, activeDropNode).children) ||
          [];

        const isDraggingOverEmptyContainer = activeDropNodeInfo
          ? isContainerComponent(activeDropNodeInfo) && activeDropNodeChildren.length === 0
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
          if (
            isDraggingOverElement &&
            activeDropNodeInfo &&
            isContainerComponent(activeDropNodeInfo) &&
            isHorizontalContainer(activeDropNodeInfo)
          ) {
            const fractionalY = relativeY / activeDropNodeRect.height;

            if (fractionalY > 0.2 && fractionalY < 0.8) {
              activeDropZone = DropZone.CENTER;
            }
          }
        }
      }

      const hasChangedHighlightedArea =
        activeDropNodeId !== dragOverNodeId || activeDropZone !== dragOverNodeZone;

      if (
        activeDropNodeId &&
        activeDropZone &&
        hasChangedHighlightedArea &&
        availableDropTargetIds.has(activeDropNodeId)
      ) {
        api.nodeDragOver({ nodeId: activeDropNodeId, zone: activeDropZone });
      } else if (dragOverNodeId && (!activeDropNodeId || !activeDropZone)) {
        api.nodeDragOver({ nodeId: null, zone: null });
      }
    },
    [
      getViewCoordinates,
      availableDropTargets,
      dropAreaRects,
      dom,
      dragOverNodeId,
      dragOverNodeZone,
      availableDropTargetIds,
      nodesInfo,
      api,
    ],
  );

  const getNodeLastChild = React.useCallback(
    (node: appDom.PageNode | appDom.ElementNode): appDom.ElementNode | null => {
      const nodeChildren = appDom.getChildNodes(dom, node).children || [];
      return nodeChildren.length > 0 ? nodeChildren[nodeChildren.length - 1] : null;
    },
    [dom],
  );

  const getNodeHighlightedZone = React.useCallback(
    (node: appDom.AppDomNode): DropZone | null => {
      const parent = appDom.getParent(dom, node);
      const parentNodeInfo = parent && nodesInfo[parent.id];

      if (dragOverNodeZone && !availableDropZones.includes(dragOverNodeZone)) {
        return null;
      }

      if (dragOverNodeZone === DropZone.CENTER) {
        if (node.id !== dragOverNodeId) {
          // Is dragging over parent element center
          if (parent && parent.id === dragOverNodeId) {
            const parentLastChild =
              appDom.isPage(parent) || appDom.isElement(parent) ? getNodeLastChild(parent) : null;

            const isParentLastChild = parentLastChild ? node.id === parentLastChild.id : false;

            return parentNodeInfo && isParentLastChild
              ? getChildNodeHighlightedZone(parentNodeInfo.direction)
              : null;
          }
          return null;
        }
        // Is dragging over own element center

        if (appDom.isPage(node)) {
          return DropZone.CENTER;
        }

        const nodeChildren =
          (appDom.isElement(node) && appDom.getChildNodes(dom, node).children) || [];
        return nodeChildren.length === 0 ? DropZone.CENTER : null;
      }

      return node.id === dragOverNodeId ? dragOverNodeZone : null;
    },
    [availableDropZones, dom, dragOverNodeId, dragOverNodeZone, getNodeLastChild, nodesInfo],
  );

  const handleDragLeave = React.useCallback(
    () => api.nodeDragOver({ nodeId: null, zone: null }),
    [api],
  );

  const deleteOrphanedLayoutComponents = React.useCallback(
    (movedOrDeletedNode: appDom.ElementNode, moveTargetNodeId: NodeId | null = null) => {
      const parent = appDom.getParent(dom, movedOrDeletedNode);
      const parentParent = parent && appDom.getParent(dom, parent);

      const parentChildren = parent ? appDom.getChildNodes(dom, parent).children : [];

      const isSecondLastColumnChild =
        parent && appDom.isElement(parent) && isPageColumn(parent) && parentChildren.length === 2;

      if (isSecondLastColumnChild) {
        const lastColumnChild = parentChildren.filter(
          (child) => child.id !== movedOrDeletedNode.id,
        )[0];

        if (parent.parentIndex && parentParent && appDom.isElement(parentParent)) {
          domApi.moveNode(lastColumnChild, parentParent, 'children', parent.parentIndex);
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
          appDom.getChildNodes(dom, parentParent).children.length === 1;

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

      if (!draggedNode || !cursorPos || !dragOverNodeId || !dragOverNodeZone) {
        return;
      }

      const dragOverNode = appDom.getNode(dom, dragOverNodeId);

      if (!appDom.isElement(dragOverNode) && !appDom.isPage(dragOverNode)) {
        return;
      }

      let parent = appDom.getParent(dom, dragOverNode);
      const originalParent = parent;
      const originalParentInfo = parent && nodesInfo[parent.id];

      const isDraggingOverPage = (dragOverNode && appDom.isPage(dragOverNode)) || false;

      let addOrMoveNode = domApi.addNode;
      if (selection) {
        addOrMoveNode = domApi.moveNode;
      }

      // Drop on page
      if (isDraggingOverPage) {
        if (!selection || !isPageRow(draggedNode)) {
          const rowContainer = appDom.createElement(dom, PAGE_ROW_COMPONENT_ID, {});
          domApi.addNode(rowContainer, dragOverNode, 'children');
          parent = rowContainer;

          addOrMoveNode(draggedNode, rowContainer, 'children');
        } else {
          addOrMoveNode(draggedNode, dragOverNode, 'children');
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
        if (!availableDropZones.includes(dragOverNodeZone)) {
          return;
        }

        // Drop on page rows (except page row center)
        if (isPageRow(dragOverNode) && dragOverNodeZone && dragOverNodeZone !== DropZone.CENTER) {
          const rowContainer = appDom.createElement(dom, PAGE_ROW_COMPONENT_ID, {});

          const newParentIndex =
            dragOverNodeZone === DropZone.TOP
              ? appDom.getNewParentIndexBeforeNode(dom, dragOverNode, 'children')
              : appDom.getNewParentIndexAfterNode(dom, dragOverNode, 'children');

          domApi.addNode(rowContainer, parent, 'children', newParentIndex);
          parent = rowContainer;
        }

        const isDraggingOverColumn = appDom.isElement(dragOverNode) && isPageColumn(dragOverNode);

        if (dragOverNodeZone === DropZone.CENTER) {
          addOrMoveNode(draggedNode, dragOverNode, 'children');
        }

        const isOriginalParentHorizontalContainer = originalParentInfo
          ? isHorizontalContainer(originalParentInfo)
          : false;
        const isOriginalParentColumn = originalParent
          ? appDom.isElement(originalParent) && isPageColumn(originalParent)
          : false;

        if ([DropZone.TOP, DropZone.BOTTOM].includes(dragOverNodeZone)) {
          if (isOriginalParentHorizontalContainer && !isDraggingOverColumn) {
            const columnContainer = appDom.createElement(dom, PAGE_COLUMN_COMPONENT_ID, {});
            domApi.addNode(
              columnContainer,
              parent,
              'children',
              appDom.getNewParentIndexAfterNode(dom, dragOverNode, 'children'),
            );
            parent = columnContainer;

            // Move existing element inside column right away if drag over zone is bottom
            if (dragOverNodeZone === DropZone.BOTTOM) {
              domApi.moveNode(dragOverNode, parent, 'children');
            }
          }

          const newParentIndex =
            dragOverNodeZone === DropZone.TOP
              ? appDom.getNewParentIndexBeforeNode(dom, dragOverNode, 'children')
              : appDom.getNewParentIndexAfterNode(dom, dragOverNode, 'children');

          addOrMoveNode(
            draggedNode,
            isDraggingOverColumn ? dragOverNode : parent,
            'children',
            newParentIndex,
          );

          // Only move existing element inside column in the end if drag over zone is top
          if (
            isOriginalParentHorizontalContainer &&
            !isDraggingOverColumn &&
            dragOverNodeZone === DropZone.TOP
          ) {
            domApi.moveNode(dragOverNode, parent, 'children');
          }
        }

        if ([DropZone.RIGHT, DropZone.LEFT].includes(dragOverNodeZone)) {
          if (isOriginalParentColumn) {
            const rowContainer = appDom.createElement(dom, PAGE_ROW_COMPONENT_ID, {});
            domApi.addNode(
              rowContainer,
              parent,
              'children',
              appDom.getNewParentIndexAfterNode(dom, dragOverNode, 'children'),
            );
            parent = rowContainer;

            // Move existing element inside stack right away if drag over zone is right
            if (dragOverNodeZone === DropZone.RIGHT) {
              domApi.moveNode(dragOverNode, parent, 'children');
            }
          }

          const newParentIndex =
            dragOverNodeZone === DropZone.RIGHT
              ? appDom.getNewParentIndexAfterNode(dom, dragOverNode, 'children')
              : appDom.getNewParentIndexBeforeNode(dom, dragOverNode, 'children');

          addOrMoveNode(draggedNode, parent, 'children', newParentIndex);

          // Only move existing element inside column in the end if drag over zone is left
          if (isOriginalParentColumn && dragOverNodeZone === DropZone.LEFT) {
            domApi.moveNode(dragOverNode, parent, 'children');
          }
        }
      }

      api.nodeDragEnd();

      if (selection) {
        deleteOrphanedLayoutComponents(draggedNode, dragOverNode.id);
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
      dragOverNodeZone,
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

      const newSelectedNodeId = findNodeAt(pageNodes, dropAreaRects, cursorPos.x, cursorPos.y);
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

  const isDraggedComponentDroppable =
    (dragOverNodeId &&
      availableDropTargetIds.has(dragOverNodeId) &&
      availableDropZones.includes(dragOverNodeZone)) ||
    false;

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
            [overlayClasses.componentDroppable]: isDraggedComponentDroppable,
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

            const isPageNodeHub = appDom.isPage(node) && pageNodes.length === 1;

            const hasContainer = nodeInfo ? isContainerComponent(nodeInfo) : false;

            const rect = dropAreaRects[node.id];
            if (!rect) {
              return null;
            }

            return (
              <React.Fragment key={node.id}>
                {isPageNodeHub || appDom.isElement(node) ? (
                  <NodeHud
                    node={node}
                    parentInfo={parentInfo}
                    rect={rect}
                    highlightedZone={getNodeHighlightedZone(node)}
                    selected={selectedNode?.id === node.id}
                    allowInteraction={isPageNodeHub ? false : nodesWithInteraction.has(node.id)}
                    onDragStart={handleDragStart}
                    onDelete={() => handleDelete(node.id)}
                    hasContainer={hasContainer}
                  />
                ) : null}
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
