import * as React from 'react';
import { NodeId } from '@mui/toolpad-core';
import { styled } from '@mui/material';
import clsx from 'clsx';
import invariant from 'invariant';

import * as appDom from '../../../../appDom';
import { useDom, useDomApi } from '../../../DomLoader';
import {
  DropZone,
  DROP_ZONE_BOTTOM,
  DROP_ZONE_CENTER,
  DROP_ZONE_LEFT,
  DROP_ZONE_RIGHT,
  DROP_ZONE_TOP,
  usePageEditorApi,
  usePageEditorState,
} from '../PageEditorProvider';
import {
  isPageLayoutComponent,
  isPageRow,
  isPageColumn,
  PAGE_ROW_COMPONENT_ID,
  PAGE_COLUMN_COMPONENT_ID,
} from '../../../../toolpadComponents';
import { PinholeOverlay } from '../../../../PinholeOverlay';
import {
  getRectanglePointActiveEdge,
  isHorizontalFlow,
  isReverseFlow,
  isVerticalFlow,
  Rectangle,
  RectangleEdge,
  RECTANGLE_EDGE_BOTTOM,
  RECTANGLE_EDGE_LEFT,
  RECTANGLE_EDGE_RIGHT,
  RECTANGLE_EDGE_TOP,
  rectContainsPoint,
} from '../../../../utils/geometry';
import { EditorCanvasHostHandle } from '../EditorCanvasHost';
import NodeHud from './NodeHud';
import { OverlayGrid, OverlayGridHandle } from './OverlayGrid';
import { NodeInfo } from '../../../../types';
import NodeDropArea from './NodeDropArea';

const HORIZONTAL_RESIZE_SNAP_UNITS = 4; // px
const SNAP_TO_GRID_COLUMN_MARGIN = 10; // px

const VERTICAL_RESIZE_SNAP_UNITS = 2; // px

const MIN_RESIZABLE_ELEMENT_HEIGHT = 100; // px

const overlayClasses = {
  hud: 'Toolpad_Hud',
  nodeHud: 'Toolpad_NodeHud',
  container: 'Toolpad_Container',
  hudOverlay: 'Toolpad_HudOverlay',
  nodeDrag: 'Toolpad_NodeDrag',
  resizeHorizontal: 'Toolpad_ResizeHorizontal',
  resizeVertical: 'Toolpad_ResizeVertical',
};

const OverlayRoot = styled('div')({
  pointerEvents: 'none',
  width: '100%',
  height: '100%',
  '&:focus': {
    outline: 'none',
  },
  [`&.${overlayClasses.nodeDrag}`]: {
    cursor: 'copy',
  },
  [`&.${overlayClasses.resizeHorizontal}`]: {
    cursor: 'ew-resize',
  },
  [`&.${overlayClasses.resizeVertical}`]: {
    cursor: 'ns-resize',
  },
  [`.${overlayClasses.hudOverlay}`]: {
    position: 'absolute',
    inset: '0 0 0 0',
  },
});

export function findAreaAt(
  areaRects: Record<string, Rectangle>,
  x: number,
  y: number,
): string | null {
  const rectEntries = Object.entries(areaRects);

  // Search deepest nested first
  for (let i = rectEntries.length - 1; i >= 0; i -= 1) {
    const areaRectEntry = rectEntries[i];

    const areaId = areaRectEntry[0];
    const areaRect = areaRectEntry[1];

    if (rectContainsPoint(areaRect, x, y)) {
      return areaId;
    }
  }
  return null;
}

function hasFreeNodeSlots(nodeInfo: NodeInfo): boolean {
  return Object.keys(nodeInfo.slots || []).length > 0;
}

function getRectangleEdgeDropZone(edge: RectangleEdge | null): DropZone | null {
  switch (edge) {
    case RECTANGLE_EDGE_TOP:
      return DROP_ZONE_TOP;
    case RECTANGLE_EDGE_RIGHT:
      return DROP_ZONE_RIGHT;
    case RECTANGLE_EDGE_BOTTOM:
      return DROP_ZONE_BOTTOM;
    case RECTANGLE_EDGE_LEFT:
      return DROP_ZONE_LEFT;
    default:
      return null;
  }
}

function getDropAreaId(nodeId: string, parentProp: string): string {
  return `${nodeId}:${parentProp}`;
}

function getDropAreaNodeId(dropAreaId: string): NodeId {
  return dropAreaId.split(':')[0] as NodeId;
}

function getDropAreaParentProp(dropAreaId: string): string | null {
  return dropAreaId.split(':')[1] || null;
}

function deleteOrphanedLayoutComponents(
  draftDom: appDom.AppDom,
  movedOrDeletedNode: appDom.ElementNode,
  moveTargetNodeId: NodeId | null = null,
): appDom.AppDom {
  const movedOrDeletedNodeParentProp = movedOrDeletedNode.parentProp;

  const parent = appDom.getParent(draftDom, movedOrDeletedNode);
  const parentParent = parent && appDom.getParent(draftDom, parent);
  const parentParentParent = parentParent && appDom.getParent(draftDom, parentParent);

  const parentChildren =
    parent && movedOrDeletedNodeParentProp
      ? (appDom.getChildNodes(draftDom, parent) as appDom.NodeChildren<appDom.ElementNode>)[
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
    appDom.getChildNodes(draftDom, parentParent)[parent.parentProp].length === 1;

  const isSecondLastLayoutContainerChild =
    parent &&
    appDom.isElement(parent) &&
    isPageLayoutComponent(parent) &&
    parentChildren.length === 2;

  const hasNoLayoutContainerSiblings =
    parentChildren.filter(
      (child) => child.id !== movedOrDeletedNode.id && (isPageRow(child) || isPageColumn(child)),
    ).length === 0;

  if (isSecondLastLayoutContainerChild && hasNoLayoutContainerSiblings) {
    if (parent.parentIndex && parentParent && appDom.isElement(parentParent)) {
      const lastContainerChild = parentChildren.filter(
        (child) => child.id !== movedOrDeletedNode.id,
      )[0];

      if (lastContainerChild.parentProp) {
        if (
          moveTargetNodeId !== parent.id &&
          moveTargetNodeId !== lastContainerChild.id &&
          isPageLayoutComponent(parentParent)
        ) {
          draftDom = appDom.moveNode(
            draftDom,
            lastContainerChild,
            parentParent,
            lastContainerChild.parentProp,
            parent.parentIndex,
          );

          if (isPageColumn(parent)) {
            draftDom = appDom.setNodeNamespacedProp(
              draftDom,
              lastContainerChild,
              'layout',
              'columnSize',
              parent.layout?.columnSize || appDom.createConst(1),
            );
          }

          draftDom = appDom.removeNode(draftDom, parent.id);
        }

        if (
          parentParent.parentIndex &&
          parentParentParent &&
          appDom.isElement(parentParentParent) &&
          isParentOnlyLayoutContainerChild &&
          moveTargetNodeId !== parentParent.id &&
          moveTargetNodeId !== lastContainerChild.id
        ) {
          draftDom = appDom.moveNode(
            draftDom,
            lastContainerChild,
            parentParentParent,
            lastContainerChild.parentProp,
            parentParent.parentIndex,
          );

          if (isPageColumn(parentParent)) {
            draftDom = appDom.setNodeNamespacedProp(
              draftDom,
              lastContainerChild,
              'layout',
              'columnSize',
              parentParent.layout?.columnSize || appDom.createConst(1),
            );
          }

          draftDom = appDom.removeNode(draftDom, parentParent.id);
        }
      }
    }
  }

  if (isOnlyLayoutContainerChild) {
    draftDom = appDom.removeNode(draftDom, parent.id);

    if (isParentOnlyLayoutContainerChild && moveTargetNodeId !== parentParent.id) {
      draftDom = appDom.removeNode(draftDom, parentParent.id);
    }
  }

  return draftDom;
}

interface RenderOverlayProps {
  canvasHostRef: React.RefObject<EditorCanvasHostHandle>;
}

export default function RenderOverlay({ canvasHostRef }: RenderOverlayProps) {
  const dom = useDom();
  const domApi = useDomApi();
  const api = usePageEditorApi();
  const {
    selection,
    viewState,
    nodeId: pageNodeId,
    newNode,
    draggedNodeId,
    draggedEdge,
    dragOverNodeId,
    dragOverSlotParentProp,
    dragOverZone,
    isDraggingOver,
  } = usePageEditorState();

  const { nodes: nodesInfo } = viewState;

  const pageNode = appDom.getNode(dom, pageNodeId, 'page');

  const pageNodes = React.useMemo(() => {
    return [pageNode, ...appDom.getDescendants(dom, pageNode)];
  }, [dom, pageNode]);

  const selectedNode = selection && appDom.getMaybeNode(dom, selection);

  const overlayRef = React.useRef<HTMLDivElement | null>(null);

  const draggedNode = React.useMemo(
    (): appDom.ElementNode | null =>
      newNode || (draggedNodeId && appDom.getNode(dom, draggedNodeId, 'element')),
    [dom, draggedNodeId, newNode],
  );

  const selectionRects = React.useMemo(() => {
    const rects: Record<string, Rectangle> = {};

    pageNodes.forEach((node) => {
      const nodeInfo = nodesInfo[node.id];
      const nodeRect = nodeInfo?.rect || null;

      if (nodeRect) {
        rects[node.id] = nodeRect;
      }
    });

    return rects;
  }, [nodesInfo, pageNodes]);

  const previousRowColumnCountsRef = React.useRef<Record<NodeId, number>>({});

  const normalizePageRowColumnSizes = React.useCallback(
    (draftDom: appDom.AppDom): appDom.AppDom => {
      pageNodes.forEach((node: appDom.AppDomNode) => {
        if (appDom.isElement(node) && isPageRow(node)) {
          const nodeChildren = appDom.getChildNodes(dom, node).children;
          const childrenCount = nodeChildren?.length || 0;

          if (childrenCount > 0 && childrenCount < previousRowColumnCountsRef.current[node.id]) {
            const layoutColumnSizes = nodeChildren.map(
              (child) => child.layout?.columnSize?.value || 1,
            );
            const totalLayoutColumnSizes = layoutColumnSizes.reduce((acc, size) => acc + size, 0);

            const normalizedLayoutColumnSizes = layoutColumnSizes.map(
              (size) => (size * nodeChildren.length) / totalLayoutColumnSizes,
            );

            nodeChildren.forEach((child, childIndex) => {
              if (child.layout?.columnSize) {
                draftDom = appDom.setNodeNamespacedProp(
                  draftDom,
                  child,
                  'layout',
                  'columnSize',
                  appDom.createConst(normalizedLayoutColumnSizes[childIndex]),
                );
              }
            });
          }

          previousRowColumnCountsRef.current[node.id] = childrenCount;
        }
      });

      return draftDom;
    },
    [dom, pageNodes],
  );

  const updateDom = React.useCallback(
    (draftDom: appDom.AppDom) => {
      draftDom = normalizePageRowColumnSizes(draftDom);
      domApi.update(draftDom);
    },
    [domApi, normalizePageRowColumnSizes],
  );

  const handleNodeMouseUp = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const cursorPos = canvasHostRef.current?.getViewCoordinates(event.clientX, event.clientY);

      if (!cursorPos || draggedNodeId) {
        return;
      }

      const newSelectedNodeId = findAreaAt(selectionRects, cursorPos.x, cursorPos.y);
      const newSelectedNode =
        newSelectedNodeId && appDom.getMaybeNode(dom, newSelectedNodeId as NodeId);
      if (newSelectedNode && appDom.isElement(newSelectedNode)) {
        api.select(newSelectedNodeId as NodeId);
      } else {
        api.select(null);
      }
    },
    [canvasHostRef, draggedNodeId, selectionRects, dom, api],
  );

  const handleNodeDelete = React.useCallback(
    (nodeId: NodeId) => (event?: React.MouseEvent<HTMLElement>) => {
      if (event) {
        event.stopPropagation();
      }

      let draftDom = dom;

      const toRemove = appDom.getNode(draftDom, nodeId);

      draftDom = appDom.removeNode(draftDom, toRemove.id);

      if (appDom.isElement(toRemove)) {
        draftDom = deleteOrphanedLayoutComponents(draftDom, toRemove);
      }

      updateDom(draftDom);

      api.deselect();
    },
    [dom, updateDom, api],
  );

  const selectedRect = selectedNode ? nodesInfo[selectedNode.id]?.rect : null;

  const interactiveNodes = React.useMemo<Set<NodeId>>(() => {
    if (!selectedNode) {
      return new Set();
    }
    return new Set(
      [...appDom.getPageAncestors(dom, selectedNode), selectedNode].map(
        (interactiveNode) => interactiveNode.id,
      ),
    );
  }, [dom, selectedNode]);

  const handleNodeDragStart = React.useCallback(
    (node: appDom.ElementNode) => (event: React.DragEvent<HTMLDivElement>) => {
      event.stopPropagation();

      if (appDom.isElement(node)) {
        event.dataTransfer.dropEffect = 'move';
        api.select(node.id);
        api.existingNodeDragStart(node);
      }
    },
    [api],
  );

  const handleNodeDuplicate = React.useCallback(
    (node: appDom.ElementNode) => (event: React.MouseEvent) => {
      event.stopPropagation();

      domApi.duplicateNode(node);
    },
    [domApi],
  );

  const handleEdgeDragStart = React.useCallback(
    (node: appDom.ElementNode, edge: RectangleEdge) => (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();

      api.edgeDragStart({ nodeId: node.id, edge });

      api.select(node.id);
    },
    [api],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (selection && event.key === 'Backspace') {
        handleNodeDelete(selection)();
      }
    },
    [handleNodeDelete, selection],
  );

  const isEmptyPage = pageNodes.length <= 1;

  const availableDropTargets = React.useMemo((): appDom.AppDomNode[] => {
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
  }, [dom, draggedNode, pageNodes, selectedNode]);

  const availableDropTargetIds = React.useMemo(
    () => new Set(availableDropTargets.map((n) => n.id)),
    [availableDropTargets],
  );

  const availableDropZones = React.useMemo((): DropZone[] => {
    const dragOverNode = dragOverNodeId && appDom.getNode(dom, dragOverNodeId);
    const dragOverNodeInfo = dragOverNodeId && nodesInfo[dragOverNodeId];

    const dragOverNodeParentProp = dragOverNode?.parentProp;

    const dragOverNodeSlots = dragOverNodeInfo?.slots;
    const dragOverSlot =
      dragOverNodeSlots && dragOverSlotParentProp && dragOverNodeSlots[dragOverSlotParentProp];

    const dragOverParent = dragOverNode && appDom.getParent(dom, dragOverNode);
    const dragOverParentInfo = dragOverParent && nodesInfo[dragOverParent.id];

    const dragOverParentFreeSlots = dragOverParentInfo?.slots;
    const dragOverParentFreeSlot =
      dragOverParentFreeSlots &&
      dragOverNodeParentProp &&
      dragOverParentFreeSlots[dragOverNodeParentProp];

    const isDraggingOverPageRowChild =
      dragOverParent && appDom.isElement(dragOverParent) ? isPageRow(dragOverParent) : false;
    const isDraggingOverPageColumnChild =
      dragOverParent && appDom.isElement(dragOverParent) ? isPageColumn(dragOverParent) : false;
    const isDraggingOverHorizontalContainerChild = dragOverParentFreeSlot
      ? isHorizontalFlow(dragOverParentFreeSlot.flowDirection)
      : false;
    const isDraggingOverVerticalContainerChild = dragOverParentFreeSlot
      ? isVerticalFlow(dragOverParentFreeSlot.flowDirection)
      : false;

    const hasChildHorizontalDropZones =
      !isDraggingOverVerticalContainerChild || isDraggingOverPageColumnChild;
    const hasChildVerticalDropZones =
      !isDraggingOverHorizontalContainerChild || isDraggingOverPageRowChild;

    if (draggedNode && dragOverNode) {
      if (appDom.isPage(dragOverNode)) {
        return [...(isEmptyPage ? [] : [DROP_ZONE_TOP]), DROP_ZONE_CENTER] as DropZone[];
      }

      if (dragOverNodeInfo && !hasFreeNodeSlots(dragOverNodeInfo) && !dragOverParentFreeSlot) {
        return [];
      }

      const isDraggingPageRow = draggedNode ? isPageRow(draggedNode) : false;
      const isDraggingPageColumn = draggedNode ? isPageColumn(draggedNode) : false;

      const isDraggingOverHorizontalContainer =
        dragOverSlot && isHorizontalFlow(dragOverSlot.flowDirection);
      const isDraggingOverVerticalContainer =
        dragOverSlot && isVerticalFlow(dragOverSlot.flowDirection);

      const isDraggingOverPageRow = appDom.isElement(dragOverNode) && isPageRow(dragOverNode);

      if (isDraggingPageRow) {
        return [
          ...(hasChildVerticalDropZones ? [DROP_ZONE_TOP, DROP_ZONE_BOTTOM] : []),
          ...(isDraggingOverVerticalContainer ? [DROP_ZONE_CENTER] : []),
        ] as DropZone[];
      }

      if (isDraggingPageColumn) {
        return [
          ...(hasChildHorizontalDropZones ? [DROP_ZONE_RIGHT, DROP_ZONE_LEFT] : []),
          ...(isDraggingOverPageRow && hasChildVerticalDropZones
            ? [DROP_ZONE_TOP, DROP_ZONE_BOTTOM]
            : []),
          ...(isDraggingOverHorizontalContainer ? [DROP_ZONE_CENTER] : []),
        ] as DropZone[];
      }

      if (isDraggingOverHorizontalContainer) {
        const isDraggingOverPageChild = dragOverParent ? appDom.isPage(dragOverParent) : false;

        return [
          DROP_ZONE_TOP,
          DROP_ZONE_BOTTOM,
          DROP_ZONE_CENTER,
          ...((isDraggingOverPageChild ? [DROP_ZONE_LEFT, DROP_ZONE_RIGHT] : []) as DropZone[]),
        ];
      }
      if (isDraggingOverVerticalContainer) {
        return [DROP_ZONE_RIGHT, DROP_ZONE_LEFT, DROP_ZONE_CENTER];
      }
    }

    return [
      ...(hasChildHorizontalDropZones ? [DROP_ZONE_RIGHT, DROP_ZONE_LEFT] : []),
      ...(hasChildVerticalDropZones ? [DROP_ZONE_TOP, DROP_ZONE_BOTTOM] : []),
    ] as DropZone[];
  }, [dom, dragOverNodeId, dragOverSlotParentProp, draggedNode, isEmptyPage, nodesInfo]);

  const dropAreaRects = React.useMemo(() => {
    const rects: Record<string, Rectangle> = {};

    pageNodes.forEach((node) => {
      const nodeId = node.id;
      const nodeInfo = nodesInfo[nodeId];

      const nodeRect = nodeInfo?.rect;

      const nodeParentProp = node.parentProp;

      const nodeSlots = nodeInfo?.slots || [];
      const nodeSlotEntries = Object.entries(nodeSlots);

      const hasFreeSlots = nodeSlotEntries.length > 0;

      const baseRects = [
        nodeRect,
        ...nodeSlotEntries.map(([, slot]) => (slot ? slot.rect : null)).filter(Boolean),
      ];

      baseRects.forEach((baseRect, baseRectIndex) => {
        const parent = appDom.getParent(dom, node);
        const parentInfo = parent && nodesInfo[parent.id];

        const parentRect = parentInfo?.rect;

        const parentProp = hasFreeSlots ? Object.keys(nodeSlots)[baseRectIndex - 1] : null;

        let parentAwareBaseRect = baseRect;

        const isPageChild = parent ? appDom.isPage(parent) : false;

        if (
          nodeInfo &&
          parentInfo &&
          baseRect &&
          (isPageChild || appDom.isElement(parent)) &&
          hasFreeNodeSlots(parentInfo)
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

          let gapCount = 2;
          if (isFirstChild || isLastChild) {
            gapCount = 1;
          }
          if (isFirstChild && isLastChild) {
            gapCount = 0;
          }

          const parentSlots = parentInfo?.slots;
          const parentSlot = (parentSlots && nodeParentProp && parentSlots[nodeParentProp]) || null;

          const isParentVerticalContainer = parentSlot
            ? isVerticalFlow(parentSlot.flowDirection)
            : false;
          const isParentHorizontalContainer = parentSlot
            ? isHorizontalFlow(parentSlot.flowDirection)
            : false;

          const isParentReverseContainer = parentSlot
            ? isReverseFlow(parentSlot.flowDirection)
            : false;

          let parentGap = 0;
          if (nodesInfo && gapCount > 0) {
            const firstChildInfo = nodesInfo[parentChildren[0].id];
            const secondChildInfo = nodesInfo[parentChildren[1].id];

            const firstChildRect = firstChildInfo?.rect;
            const secondChildRect = secondChildInfo?.rect;

            if (firstChildRect && secondChildRect) {
              if (isParentHorizontalContainer) {
                parentGap =
                  (isParentReverseContainer
                    ? firstChildRect.x - secondChildRect.x - secondChildRect.width
                    : secondChildRect.x - firstChildRect.x - firstChildRect.width) / 2;
              }
              if (isParentVerticalContainer) {
                parentGap =
                  (isParentReverseContainer
                    ? firstChildRect.y - secondChildRect.y - secondChildRect.height
                    : secondChildRect.y - firstChildRect.y - firstChildRect.height) / 2;
              }
            }
          }

          const hasPositionGap = isParentReverseContainer ? isLastChild : isFirstChild;
          if (isParentVerticalContainer) {
            parentAwareBaseRect = {
              x: isPageChild ? 0 : baseRect.x,
              y: hasPositionGap ? baseRect.y : baseRect.y - parentGap,
              width: isPageChild && parentRect ? parentRect.width : baseRect.width,
              height: baseRect.height + gapCount * parentGap,
            };
          }
          if (isParentHorizontalContainer) {
            parentAwareBaseRect = {
              ...baseRect,
              x: hasPositionGap ? baseRect.x : baseRect.x - parentGap,
              width: baseRect.width + gapCount * parentGap,
            };
          }

          if (parentAwareBaseRect) {
            if (parentProp) {
              rects[getDropAreaId(nodeId, parentProp)] = parentAwareBaseRect;
            } else {
              rects[nodeId] = parentAwareBaseRect;
            }
          }
        } else if (parentProp && baseRect) {
          rects[getDropAreaId(nodeId, parentProp)] = baseRect;
        } else if (baseRect) {
          rects[nodeId] = baseRect;
        }
      });
    });

    return rects;
  }, [dom, nodesInfo, pageNodes]);

  const getDropAreaRect = React.useCallback(
    (nodeId: NodeId, parentProp?: string) => {
      if (parentProp) {
        const dropAreaId = getDropAreaId(nodeId, parentProp);
        return dropAreaRects[dropAreaId];
      }
      return dropAreaRects[nodeId];
    },
    [dropAreaRects],
  );

  const handleNodeDragOver = React.useCallback(
    (event: React.DragEvent<Element>) => {
      event.preventDefault();

      const cursorPos = canvasHostRef.current?.getViewCoordinates(event.clientX, event.clientY);

      if (!cursorPos || !draggedNode) {
        return;
      }

      const activeDropAreaId = findAreaAt(dropAreaRects, cursorPos.x, cursorPos.y);

      const activeDropNodeId: NodeId =
        (activeDropAreaId && getDropAreaNodeId(activeDropAreaId)) || pageNode.id;

      const activeDropNode = appDom.getNode(dom, activeDropNodeId);

      const activeDropNodeInfo = nodesInfo[activeDropNodeId];
      const activeDropNodeRect = activeDropNodeInfo?.rect;

      const activeDropNodeParent = appDom.getParent(dom, activeDropNode);
      const activeDropNodeSiblings = appDom.getSiblings(dom, activeDropNode);

      const isDraggingOverPage = appDom.isPage(activeDropNode);
      const isDraggingOverElement = appDom.isElement(activeDropNode);

      const activeDropSlotParentProp = isDraggingOverPage
        ? 'children'
        : activeDropAreaId && getDropAreaParentProp(activeDropAreaId);

      const isDraggingOverContainer = activeDropNodeInfo
        ? hasFreeNodeSlots(activeDropNodeInfo) && activeDropSlotParentProp
        : false;

      let activeDropZone = null;

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
        ? isDraggingOverContainer && activeDropNodeChildren.length === 0
        : false;

      const activeDropAreaRect =
        isDraggingOverContainer && activeDropSlotParentProp
          ? getDropAreaRect(activeDropNodeId, activeDropSlotParentProp)
          : getDropAreaRect(activeDropNodeId);

      if (activeDropAreaRect) {
        const relativeX = cursorPos.x - activeDropAreaRect.x;
        const relativeY = cursorPos.y - activeDropAreaRect.y;

        activeDropZone = isDraggingOverEmptyContainer
          ? DROP_ZONE_CENTER
          : getRectangleEdgeDropZone(
              getRectanglePointActiveEdge(activeDropAreaRect, relativeX, relativeY),
            );

        if (isDraggingOverPage) {
          if (activeDropNodeRect && relativeY < 0 && !isEmptyPage) {
            activeDropZone = DROP_ZONE_TOP;
          } else {
            activeDropZone = DROP_ZONE_CENTER;
          }
        }

        const edgeDetectionMargin = 10; // px

        // Detect center in layout containers
        if (isDraggingOverElement && activeDropNodeInfo && activeDropSlot) {
          const isDraggingOverPageChild = activeDropNodeParent
            ? appDom.isPage(activeDropNodeParent)
            : false;

          if (isHorizontalFlow(activeDropSlot.flowDirection)) {
            if (
              isDraggingOverPageChild &&
              activeDropNodeRect &&
              relativeX <= activeDropNodeRect.x
            ) {
              activeDropZone = DROP_ZONE_LEFT;
            } else if (
              isDraggingOverPageChild &&
              activeDropNodeRect &&
              relativeX >= activeDropNodeRect.x + activeDropNodeRect.width
            ) {
              activeDropZone = DROP_ZONE_RIGHT;
            } else if (relativeY <= edgeDetectionMargin) {
              activeDropZone = DROP_ZONE_TOP;
            } else if (activeDropAreaRect.height - relativeY <= edgeDetectionMargin) {
              activeDropZone = DROP_ZONE_BOTTOM;
            } else {
              activeDropZone = DROP_ZONE_CENTER;
            }
          }
          if (isVerticalFlow(activeDropSlot.flowDirection)) {
            if (relativeX <= edgeDetectionMargin) {
              activeDropZone = DROP_ZONE_LEFT;
            } else if (activeDropAreaRect.width - relativeX <= edgeDetectionMargin) {
              activeDropZone = DROP_ZONE_RIGHT;
            } else {
              activeDropZone = DROP_ZONE_CENTER;
            }
          }
        }
      }

      const hasChangedDropArea =
        activeDropNodeId !== dragOverNodeId ||
        activeDropSlotParentProp !== dragOverSlotParentProp ||
        activeDropZone !== dragOverZone;

      if (activeDropZone && hasChangedDropArea && availableDropTargetIds.has(activeDropNodeId)) {
        const isDragOverParentPageRow =
          activeDropNodeParent &&
          appDom.isElement(activeDropNodeParent) &&
          isPageRow(activeDropNodeParent);

        const activeDropNodeParentParent =
          activeDropNodeParent && appDom.getParent(dom, activeDropNodeParent);
        const activeDropNodeParentParentInfo =
          activeDropNodeParentParent && nodesInfo[activeDropNodeParentParent.id];
        const hasActiveDropNodeParentParentSlot = !!(
          activeDropNodeParentParentInfo?.slots &&
          activeDropNodeParentParentInfo?.slots[activeDropSlotParentProp || 'children']
        );

        const hasDragOverParentRowOverride =
          isDragOverParentPageRow &&
          hasActiveDropNodeParentParentSlot &&
          activeDropNodeSiblings.length === 0 &&
          (activeDropZone === DROP_ZONE_TOP || activeDropZone === DROP_ZONE_BOTTOM);

        api.nodeDragOver({
          nodeId: hasDragOverParentRowOverride ? activeDropNodeParent.id : activeDropNodeId,
          parentProp: activeDropSlotParentProp,
          zone: activeDropZone as DropZone,
        });
      }
    },
    [
      canvasHostRef,
      draggedNode,
      dropAreaRects,
      pageNode.id,
      dom,
      nodesInfo,
      getDropAreaRect,
      dragOverNodeId,
      dragOverSlotParentProp,
      dragOverZone,
      availableDropTargetIds,
      isEmptyPage,
      api,
    ],
  );

  const handleNodeDrop = React.useCallback(
    (event: React.DragEvent<Element>) => {
      const cursorPos = canvasHostRef.current?.getViewCoordinates(event.clientX, event.clientY);

      if (
        !draggedNode ||
        !cursorPos ||
        !dragOverNodeId ||
        !dragOverZone ||
        !availableDropZones.includes(dragOverZone)
      ) {
        return;
      }

      const dragOverNode = appDom.getNode(dom, dragOverNodeId);

      if (!appDom.isElement(dragOverNode) && !appDom.isPage(dragOverNode)) {
        return;
      }

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
      const isDraggingOverLayoutSlot = dragOverSlot?.type === 'layout';
      const isDraggingOverElement = appDom.isElement(dragOverNode);

      let parent = appDom.getParent(dom, dragOverNode);

      const originalParent = parent;
      const originalParentInfo = parent && nodesInfo[parent.id];

      const isOriginalParentPage = originalParent ? appDom.isPage(originalParent) : false;
      const isOriginalParentRow =
        originalParent && appDom.isElement(originalParent) ? isPageRow(originalParent) : false;
      const isOriginalParentColumn =
        originalParent && appDom.isElement(originalParent) ? isPageColumn(originalParent) : false;

      let addOrMoveNode = appDom.addNode;
      if (selection) {
        addOrMoveNode = appDom.moveNode;
      }

      let draftDom = dom;

      // Drop on page or layout slot
      if (isDraggingOverPage || isDraggingOverLayoutSlot) {
        const newParentIndex =
          dragOverZone === DROP_ZONE_TOP
            ? appDom.getNewFirstParentIndexInNode(draftDom, dragOverNode, 'children')
            : appDom.getNewLastParentIndexInNode(draftDom, dragOverNode, 'children');

        if (!isPageRow(draggedNode)) {
          const rowContainer = appDom.createElement(draftDom, PAGE_ROW_COMPONENT_ID, {});
          draftDom = appDom.addNode(
            draftDom,
            rowContainer,
            dragOverNode,
            'children',
            newParentIndex,
          );
          parent = rowContainer;

          draftDom = addOrMoveNode(draftDom, draggedNode, rowContainer, 'children');
        } else {
          draftDom = addOrMoveNode(draftDom, draggedNode, dragOverNode, 'children', newParentIndex);
        }
      }

      if (
        isDraggingOverElement &&
        !isDraggingOverLayoutSlot &&
        parent &&
        (appDom.isPage(parent) || appDom.isElement(parent))
      ) {
        const isDraggingOverRow = isDraggingOverElement && isPageRow(dragOverNode);

        const isDraggingOverHorizontalContainer = dragOverSlot
          ? isHorizontalFlow(dragOverSlot.flowDirection)
          : false;
        const isDraggingOverVerticalContainer = dragOverSlot
          ? isVerticalFlow(dragOverSlot.flowDirection)
          : false;

        if (dragOverZone === DROP_ZONE_CENTER && dragOverSlotParentProp) {
          draftDom = addOrMoveNode(draftDom, draggedNode, dragOverNode, dragOverSlotParentProp);
        }

        if ([DROP_ZONE_TOP, DROP_ZONE_BOTTOM].includes(dragOverZone)) {
          if (!isDraggingOverVerticalContainer) {
            const newParentIndex =
              dragOverZone === DROP_ZONE_TOP
                ? appDom.getNewParentIndexBeforeNode(draftDom, dragOverNode, dragOverNodeParentProp)
                : appDom.getNewParentIndexAfterNode(draftDom, dragOverNode, dragOverNodeParentProp);

            if (isDraggingOverRow && !isPageRow(draggedNode)) {
              if (isOriginalParentPage) {
                const rowContainer = appDom.createElement(draftDom, PAGE_ROW_COMPONENT_ID, {});
                draftDom = appDom.addNode(
                  draftDom,
                  rowContainer,
                  parent,
                  dragOverNodeParentProp,
                  newParentIndex,
                );
                parent = rowContainer;

                draftDom = addOrMoveNode(draftDom, draggedNode, parent, dragOverNodeParentProp);
              } else {
                draftDom = addOrMoveNode(
                  draftDom,
                  draggedNode,
                  parent,
                  dragOverNodeParentProp,
                  newParentIndex,
                );
              }
            }

            if (isOriginalParentRow) {
              const columnContainer = appDom.createElement(
                draftDom,
                PAGE_COLUMN_COMPONENT_ID,
                {},
                {
                  columnSize: dragOverNode.layout?.columnSize || appDom.createConst(1),
                },
              );

              draftDom = appDom.setNodeNamespacedProp(
                draftDom,
                dragOverNode,
                'layout',
                'columnSize',
                appDom.createConst(1),
              );

              draftDom = appDom.addNode(
                draftDom,
                columnContainer,
                parent,
                dragOverNodeParentProp,
                appDom.getNewParentIndexAfterNode(draftDom, dragOverNode, dragOverNodeParentProp),
              );
              parent = columnContainer;

              // Move existing element inside column right away if drag over zone is bottom
              if (dragOverZone === DROP_ZONE_BOTTOM) {
                draftDom = appDom.moveNode(draftDom, dragOverNode, parent, dragOverNodeParentProp);
              }
            }

            if (!isDraggingOverRow || isPageRow(draggedNode)) {
              draftDom = addOrMoveNode(
                draftDom,
                draggedNode,
                parent,
                dragOverNodeParentProp,
                newParentIndex,
              );
            }

            // Only move existing element inside column in the end if drag over zone is top
            if (
              isOriginalParentRow &&
              !isDraggingOverVerticalContainer &&
              dragOverZone === DROP_ZONE_TOP
            ) {
              draftDom = appDom.moveNode(draftDom, dragOverNode, parent, dragOverNodeParentProp);
            }
          }

          if (dragOverSlotParentProp && isDraggingOverVerticalContainer) {
            const isDraggingOverDirectionStart =
              dragOverZone ===
              (dragOverSlot?.flowDirection === 'column' ? DROP_ZONE_TOP : DROP_ZONE_BOTTOM);

            const newParentIndex = isDraggingOverDirectionStart
              ? appDom.getNewFirstParentIndexInNode(draftDom, dragOverNode, dragOverSlotParentProp)
              : appDom.getNewLastParentIndexInNode(draftDom, dragOverNode, dragOverSlotParentProp);

            draftDom = addOrMoveNode(
              draftDom,
              draggedNode,
              dragOverNode,
              dragOverSlotParentProp,
              newParentIndex,
            );
          }
        }

        if ([DROP_ZONE_RIGHT, DROP_ZONE_LEFT].includes(dragOverZone)) {
          if (!isDraggingOverHorizontalContainer) {
            if (isOriginalParentColumn) {
              const rowContainer = appDom.createElement(draftDom, PAGE_ROW_COMPONENT_ID, {
                justifyContent: appDom.createConst(originalParentInfo?.props.alignItems || 'start'),
              });
              draftDom = appDom.addNode(
                draftDom,
                rowContainer,
                parent,
                dragOverNodeParentProp,
                appDom.getNewParentIndexAfterNode(draftDom, dragOverNode, dragOverNodeParentProp),
              );
              parent = rowContainer;

              // Move existing element inside right away if drag over zone is right
              if (dragOverZone === DROP_ZONE_RIGHT) {
                draftDom = appDom.moveNode(draftDom, dragOverNode, parent, dragOverNodeParentProp);
              }
            }

            const newParentIndex =
              dragOverZone === DROP_ZONE_RIGHT
                ? appDom.getNewParentIndexAfterNode(draftDom, dragOverNode, dragOverNodeParentProp)
                : appDom.getNewParentIndexBeforeNode(
                    draftDom,
                    dragOverNode,
                    dragOverNodeParentProp,
                  );

            draftDom = addOrMoveNode(
              draftDom,
              draggedNode,
              parent,
              dragOverNodeParentProp,
              newParentIndex,
            );

            // Only move existing element inside column in the end if drag over zone is left
            if (isOriginalParentColumn && dragOverZone === DROP_ZONE_LEFT) {
              draftDom = appDom.moveNode(draftDom, dragOverNode, parent, dragOverNodeParentProp);
            }
          }

          if (dragOverSlotParentProp && isDraggingOverHorizontalContainer) {
            const isDraggingOverDirectionStart =
              dragOverZone ===
              (dragOverSlot?.flowDirection === 'row' ? DROP_ZONE_LEFT : DROP_ZONE_RIGHT);

            const newParentIndex = isDraggingOverDirectionStart
              ? appDom.getNewFirstParentIndexInNode(draftDom, dragOverNode, dragOverSlotParentProp)
              : appDom.getNewLastParentIndexInNode(draftDom, dragOverNode, dragOverSlotParentProp);

            draftDom = addOrMoveNode(
              draftDom,
              draggedNode,
              dragOverNode,
              dragOverSlotParentProp,
              newParentIndex,
            );
          }
        }

        const draggedNodeParent = selection ? appDom.getParent(dom, draggedNode) : null;
        if (
          draggedNode.layout?.columnSize &&
          draggedNodeParent &&
          draggedNodeParent.id !== parent.id
        ) {
          draftDom = appDom.setNodeNamespacedProp(
            draftDom,
            draggedNode,
            'layout',
            'columnSize',
            appDom.createConst(1),
          );
        }
      }

      if (selection) {
        draftDom = deleteOrphanedLayoutComponents(draftDom, draggedNode, dragOverNodeId);
      }

      updateDom(draftDom);

      api.dragEnd();

      if (newNode) {
        api.select(newNode.id);

        // Refocus on overlay so that keyboard events can keep being caught by it
        const overlayElement = overlayRef.current;
        invariant(overlayElement, 'Overlay ref not bound');
        overlayElement.focus();
      }
    },
    [
      api,
      availableDropZones,
      canvasHostRef,
      dom,
      dragOverNodeId,
      dragOverSlotParentProp,
      dragOverZone,
      draggedNode,
      newNode,
      nodesInfo,
      selection,
      updateDom,
    ],
  );

  const handleNodeDragEnd = React.useCallback(
    (event: DragEvent | React.DragEvent) => {
      event.preventDefault();
      api.dragEnd();
    },
    [api],
  );

  React.useEffect(() => {
    const handleNodeDragOverDefault = (event: DragEvent) => {
      // Make the whole window a drop target to prevent the return animation happening on dragend
      event.preventDefault();
    };
    window.addEventListener('dragover', handleNodeDragOverDefault);
    window.addEventListener('dragend', handleNodeDragEnd);
    return () => {
      window.removeEventListener('dragover', handleNodeDragOverDefault);
      window.removeEventListener('dragend', handleNodeDragEnd);
    };
  }, [handleNodeDragEnd]);

  const resizePreviewElementRef = React.useRef<HTMLDivElement | null>(null);
  const resizePreviewElement = resizePreviewElementRef.current;

  const overlayGridRef = React.useRef<OverlayGridHandle>({
    gridElement: null,
    getMinColumnWidth: () => 0,
    getLeftColumnEdges: () => [],
    getRightColumnEdges: () => [],
  });

  const handleEdgeDragOver = React.useCallback(
    (event: React.MouseEvent<Element>) => {
      if (!draggedNode) {
        return;
      }

      const draggedNodeInfo = nodesInfo[draggedNode.id];
      const draggedNodeRect = draggedNodeInfo?.rect;

      const parent = draggedNode && appDom.getParent(dom, draggedNode);

      const parentInfo = parent ? nodesInfo[parent.id] : null;
      const parentRect = parentInfo?.rect;

      const cursorPos = canvasHostRef.current?.getViewCoordinates(event.clientX, event.clientY);

      if (draggedNodeRect && parentRect && resizePreviewElement && cursorPos) {
        if (draggedEdge === RECTANGLE_EDGE_LEFT || draggedEdge === RECTANGLE_EDGE_RIGHT) {
          let snappedToGridCursorRelativePosX =
            Math.ceil((cursorPos.x - draggedNodeRect.x) / HORIZONTAL_RESIZE_SNAP_UNITS) *
            HORIZONTAL_RESIZE_SNAP_UNITS;

          const activeSnapGridColumnEdges =
            draggedEdge === RECTANGLE_EDGE_LEFT
              ? overlayGridRef.current.getLeftColumnEdges()
              : overlayGridRef.current.getRightColumnEdges();

          for (const gridColumnEdge of activeSnapGridColumnEdges) {
            if (Math.abs(gridColumnEdge - cursorPos.x) <= SNAP_TO_GRID_COLUMN_MARGIN) {
              snappedToGridCursorRelativePosX = gridColumnEdge - draggedNodeRect.x;
            }
          }

          const minGridColumnWidth = overlayGridRef.current.getMinColumnWidth();

          const previousSibling = appDom.getSiblingBeforeNode(dom, draggedNode, 'children');
          const previousSiblingInfo = previousSibling && nodesInfo[previousSibling.id];
          const previousSiblingRect = previousSiblingInfo?.rect;

          if (
            draggedEdge === RECTANGLE_EDGE_LEFT &&
            cursorPos.x >
              Math.max(parentRect.x, previousSiblingRect?.x || 0) + minGridColumnWidth &&
            cursorPos.x < draggedNodeRect.x + draggedNodeRect.width - minGridColumnWidth
          ) {
            const updatedTransformScale =
              1 - snappedToGridCursorRelativePosX / draggedNodeRect.width;

            resizePreviewElement.style.transformOrigin = '100% 50%';
            resizePreviewElement.style.transform = `scaleX(${updatedTransformScale})`;
          }

          const nextSibling = appDom.getSiblingAfterNode(dom, draggedNode, 'children');
          const nextSiblingInfo = nextSibling && nodesInfo[nextSibling.id];
          const nextSiblingRect = nextSiblingInfo?.rect;

          if (
            draggedEdge === RECTANGLE_EDGE_RIGHT &&
            cursorPos.x > draggedNodeRect.x + minGridColumnWidth &&
            cursorPos.x <
              Math.min(
                parentRect.x + parentRect.width,
                nextSiblingRect ? nextSiblingRect.x + nextSiblingRect.width : 0,
              ) -
                minGridColumnWidth
          ) {
            const updatedTransformScale = snappedToGridCursorRelativePosX / draggedNodeRect.width;

            resizePreviewElement.style.transformOrigin = '0 50%';
            resizePreviewElement.style.transform = `scaleX(${updatedTransformScale})`;
          }
        }

        if (
          draggedEdge === RECTANGLE_EDGE_BOTTOM &&
          cursorPos.y > draggedNodeRect.y + MIN_RESIZABLE_ELEMENT_HEIGHT
        ) {
          const snappedToGridCursorRelativePosY =
            Math.ceil((cursorPos.y - draggedNodeRect.y) / VERTICAL_RESIZE_SNAP_UNITS) *
            VERTICAL_RESIZE_SNAP_UNITS;

          const updatedTransformScale = snappedToGridCursorRelativePosY / draggedNodeRect.height;

          resizePreviewElement.style.transformOrigin = '50% 0';
          resizePreviewElement.style.transform = `scaleY(${updatedTransformScale})`;
        }
      }
    },
    [canvasHostRef, dom, draggedEdge, draggedNode, nodesInfo, resizePreviewElement],
  );

  const handleEdgeDragEnd = React.useCallback(
    (event: React.MouseEvent<Element>) => {
      event.preventDefault();

      if (!draggedNode) {
        return;
      }

      const draggedNodeInfo = nodesInfo[draggedNode.id];
      const draggedNodeRect = draggedNodeInfo?.rect;

      const parent = appDom.getParent(dom, draggedNode);

      const resizePreviewRect = resizePreviewElement?.getBoundingClientRect();

      if (draggedNodeRect && resizePreviewRect) {
        let draftDom = dom;

        if (draggedEdge === RECTANGLE_EDGE_LEFT || draggedEdge === RECTANGLE_EDGE_RIGHT) {
          const parentChildren = parent ? appDom.getChildNodes(dom, parent).children : [];
          const totalLayoutColumnSizes = parentChildren.reduce(
            (acc, child) => acc + (nodesInfo[child.id]?.rect?.width || 0),
            0,
          );

          const normalizeColumnSize = (size: number) =>
            Math.max(0, size * parentChildren.length) / totalLayoutColumnSizes;

          if (draggedEdge === RECTANGLE_EDGE_LEFT) {
            const previousSibling = appDom.getSiblingBeforeNode(dom, draggedNode, 'children');

            if (previousSibling) {
              const previousSiblingInfo = nodesInfo[previousSibling.id];
              const previousSiblingRect = previousSiblingInfo?.rect;

              if (previousSiblingRect) {
                const updatedDraggedNodeColumnSize = normalizeColumnSize(resizePreviewRect.width);
                const updatedPreviousSiblingColumnSize = normalizeColumnSize(
                  previousSiblingRect.width - (resizePreviewRect.width - draggedNodeRect.width),
                );

                draftDom = appDom.setNodeNamespacedProp(
                  draftDom,
                  draggedNode,
                  'layout',
                  'columnSize',
                  appDom.createConst(updatedDraggedNodeColumnSize),
                );
                draftDom = appDom.setNodeNamespacedProp(
                  draftDom,
                  previousSibling,
                  'layout',
                  'columnSize',
                  appDom.createConst(updatedPreviousSiblingColumnSize),
                );
              }
            }
          }
          if (draggedEdge === RECTANGLE_EDGE_RIGHT) {
            const nextSibling = appDom.getSiblingAfterNode(dom, draggedNode, 'children');

            if (nextSibling) {
              const nextSiblingInfo = nodesInfo[nextSibling.id];
              const nextSiblingRect = nextSiblingInfo?.rect;

              if (nextSiblingRect) {
                const updatedDraggedNodeColumnSize = normalizeColumnSize(resizePreviewRect.width);
                const updatedNextSiblingColumnSize = normalizeColumnSize(
                  nextSiblingRect.width - (resizePreviewRect.width - draggedNodeRect.width),
                );

                draftDom = appDom.setNodeNamespacedProp(
                  draftDom,
                  draggedNode,
                  'layout',
                  'columnSize',
                  appDom.createConst(updatedDraggedNodeColumnSize),
                );
                draftDom = appDom.setNodeNamespacedProp(
                  draftDom,
                  nextSibling,
                  'layout',
                  'columnSize',
                  appDom.createConst(updatedNextSiblingColumnSize),
                );
              }
            }
          }
        }

        if (draggedEdge === RECTANGLE_EDGE_BOTTOM) {
          const resizableHeightProp = draggedNodeInfo?.componentConfig?.resizableHeightProp;

          if (resizableHeightProp) {
            draftDom = appDom.setNodeNamespacedProp(
              draftDom,
              draggedNode,
              'props',
              resizableHeightProp,
              appDom.createConst(resizePreviewRect.height),
            );
          }
        }

        updateDom(draftDom);
      }

      api.dragEnd();
    },
    [api, dom, draggedEdge, draggedNode, nodesInfo, resizePreviewElement, updateDom],
  );

  return (
    <OverlayRoot
      data-testid="page-overlay"
      ref={overlayRef}
      className={clsx({
        [overlayClasses.nodeDrag]: isDraggingOver,
        [overlayClasses.resizeHorizontal]:
          draggedEdge === RECTANGLE_EDGE_LEFT || draggedEdge === RECTANGLE_EDGE_RIGHT,
        [overlayClasses.resizeVertical]:
          draggedEdge === RECTANGLE_EDGE_TOP || draggedEdge === RECTANGLE_EDGE_BOTTOM,
      })}
      // Need this to be able to capture key events
      tabIndex={0}
      onKeyDown={handleKeyDown}
      {...(draggedEdge
        ? {
            onMouseMove: handleEdgeDragOver,
            onMouseUp: handleEdgeDragEnd,
          }
        : {
            onDragOver: handleNodeDragOver,
            onDrop: handleNodeDrop,
            onDragEnd: handleNodeDragEnd,
            // This component has `pointer-events: none`, but we will selectively enable pointer-events
            // for its children. We can still capture the click gobally
            onMouseUp: handleNodeMouseUp,
          })}
    >
      {pageNodes.map((node) => {
        const nodeParentProp = node.parentProp;

        const nodeInfo = nodesInfo[node.id];
        const nodeRect = nodeInfo?.rect || null;

        const parent = appDom.getParent(dom, node);

        const isPageNode = appDom.isPage(node);

        const isFirstChild =
          parent && appDom.isElement(parent) && nodeParentProp
            ? appDom.getNodeFirstChild(dom, parent, node.parentProp)?.id === node.id
            : false;
        const isLastChild =
          parent && appDom.isElement(parent) && nodeParentProp
            ? appDom.getNodeLastChild(dom, parent, nodeParentProp)?.id === node.id
            : false;

        const isPageRowChild = parent ? appDom.isElement(parent) && isPageRow(parent) : false;

        const isSelected = selectedNode ? selectedNode.id === node.id : false;
        const isInteractive = interactiveNodes.has(node.id) && !draggedEdge;

        const isVerticallyResizable = Boolean(nodeInfo?.componentConfig?.resizableHeightProp);

        const isResizing = Boolean(draggedEdge) && node.id === draggedNodeId;

        if (!nodeRect) {
          return null;
        }

        return (
          <React.Fragment key={node.id}>
            {!isPageNode ? (
              <NodeHud
                node={node}
                rect={nodeRect}
                isSelected={isSelected}
                isInteractive={isInteractive}
                onNodeDragStart={handleNodeDragStart(node as appDom.ElementNode)}
                onDuplicate={handleNodeDuplicate(node as appDom.ElementNode)}
                draggableEdges={[
                  ...(isPageRowChild
                    ? [
                        ...(isFirstChild ? [] : [RECTANGLE_EDGE_LEFT as RectangleEdge]),
                        ...(isLastChild ? [] : [RECTANGLE_EDGE_RIGHT as RectangleEdge]),
                      ]
                    : []),
                  ...(isVerticallyResizable ? [RECTANGLE_EDGE_BOTTOM as RectangleEdge] : []),
                ]}
                onEdgeDragStart={
                  isPageRowChild || isVerticallyResizable ? handleEdgeDragStart : undefined
                }
                onDelete={handleNodeDelete(node.id)}
                isResizing={isResizing}
                resizePreviewElementRef={resizePreviewElementRef}
              />
            ) : null}
          </React.Fragment>
        );
      })}
      {Object.entries(dropAreaRects).map(([dropAreaId, dropAreaRect]) => {
        const dropAreaNodeId = getDropAreaNodeId(dropAreaId);
        const dropAreaParentProp = getDropAreaParentProp(dropAreaId);

        const dropAreaNode = appDom.getNode(dom, dropAreaNodeId);

        return (
          <NodeDropArea
            key={dropAreaId}
            node={dropAreaNode}
            parentProp={dropAreaParentProp}
            dropAreaRect={dropAreaRect}
            availableDropZones={availableDropZones}
          />
        );
      })}
      {/* 
            This overlay allows passing through pointer-events through a pinhole
            This allows interactivity on the selected element only, while maintaining
            a reliable click target for the rest of the page 
      */}
      <PinholeOverlay className={overlayClasses.hudOverlay} pinhole={selectedRect} />
      {draggedEdge ? <OverlayGrid ref={overlayGridRef} /> : null}
    </OverlayRoot>
  );
}
