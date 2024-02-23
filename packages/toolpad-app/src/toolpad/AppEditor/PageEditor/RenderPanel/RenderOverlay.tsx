import * as React from 'react';
import { NodeId } from '@mui/toolpad-core';
import { styled } from '@mui/material';
import clsx from 'clsx';
import invariant from 'invariant';

import { omit } from '@mui/toolpad-utils/immutability';
import * as appDom from '@mui/toolpad-core/appDom';
import { useAppStateApi, useAppState, useDomApi } from '../../../AppState';
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
  isPageRow,
  isPageColumn,
  PAGE_ROW_COMPONENT_ID,
  PAGE_COLUMN_COMPONENT_ID,
  isFormComponent,
  FORM_COMPONENT_ID,
  getElementNodeComponentId,
} from '../../../../runtime/toolpadComponents';
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
import NodeHud from './NodeHud';
import { OverlayGrid, OverlayGridHandle } from './OverlayGrid';
import { NodeInfo } from '../../../../types';
import NodeDropArea from './NodeDropArea';
import type { ToolpadBridge } from '../../../../canvas/ToolpadBridge';
import { PinholeOverlay } from '../../../../PinholeOverlay';
import {
  deleteOrphanedLayoutNodes,
  normalizePageRowColumnSizes,
  removePageLayoutNode,
} from '../../pageLayout';

const VERTICAL_RESIZE_SNAP_UNITS = 4; // px

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

interface RenderOverlayProps {
  bridge: ToolpadBridge | null;
}

export default function RenderOverlay({ bridge }: RenderOverlayProps) {
  const { dom } = useAppState();
  const { currentView } = useAppState();
  const selectedNodeId = currentView.kind === 'page' ? currentView.selectedNodeId : null;
  const hoveredNodeId = currentView.kind === 'page' ? currentView.hoveredNodeId : null;

  const domApi = useDomApi();
  const appStateApi = useAppStateApi();
  const api = usePageEditorApi();
  const {
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

  const selectedNode = selectedNodeId && appDom.getMaybeNode(dom, selectedNodeId);

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

  const selectNode = React.useCallback(
    (nodeId: NodeId) => {
      if (selectedNodeId !== nodeId) {
        appStateApi.selectNode(nodeId);
      }
    },
    [appStateApi, selectedNodeId],
  );

  const deselectNode = React.useCallback(() => {
    if (selectedNodeId) {
      appStateApi.deselectNode();
    }
  }, [appStateApi, selectedNodeId]);

  const handleNodeMouseUp = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const cursorPos = bridge?.canvasCommands.getViewCoordinates(event.clientX, event.clientY);

      if (!cursorPos || draggedNodeId) {
        return;
      }

      const newSelectedNodeId = findAreaAt(selectionRects, cursorPos.x, cursorPos.y);
      const newSelectedNode =
        newSelectedNodeId && appDom.getMaybeNode(dom, newSelectedNodeId as NodeId);
      if (newSelectedNode && appDom.isElement(newSelectedNode)) {
        selectNode(newSelectedNodeId as NodeId);
      } else {
        deselectNode();
      }
    },
    [bridge, deselectNode, dom, draggedNodeId, selectNode, selectionRects],
  );

  const handleNodeDelete = React.useCallback(
    (nodeId: NodeId) => (event?: React.MouseEvent<HTMLElement>) => {
      if (event) {
        event.stopPropagation();
      }

      appStateApi.update(
        (draft) => {
          const toRemove = appDom.getNode(draft, nodeId);

          if (appDom.isElement(toRemove)) {
            draft = removePageLayoutNode(draft, toRemove);
          }

          return draft;
        },
        currentView.kind === 'page'
          ? {
              ...currentView,
              selectedNodeId: null,
            }
          : currentView,
      );
    },
    [appStateApi, currentView],
  );

  const selectedRect = (selectedNode && !newNode && nodesInfo[selectedNode.id]?.rect) || null;

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
        selectNode(node.id);
        api.existingNodeDragStart(node);
      }
    },
    [api, selectNode],
  );

  const handleNodeDuplicate = React.useCallback(
    (node: appDom.ElementNode) => (event: React.MouseEvent) => {
      event.stopPropagation();

      domApi.update((draft) => {
        draft = appDom.duplicateNode(draft, node);
        draft = normalizePageRowColumnSizes(draft, pageNode);

        return draft;
      });
    },
    [domApi, pageNode],
  );

  const getNodeDraggableHorizontalEdges = React.useCallback(
    (node: appDom.AppDomNode): RectangleEdge[] => {
      const nodeParentProp = node.parentProp;

      const parent = appDom.getParent(dom, node);

      const isFirstChild =
        parent && appDom.isElement(parent) && nodeParentProp
          ? appDom.getNodeFirstChild(dom, parent, nodeParentProp)?.id === node.id
          : false;
      const isLastChild =
        parent && appDom.isElement(parent) && nodeParentProp
          ? appDom.getNodeLastChild(dom, parent, nodeParentProp)?.id === node.id
          : false;

      const isPageRowChild = parent ? appDom.isElement(parent) && isPageRow(parent) : false;

      const isDraggableLeft = isPageRowChild ? !isFirstChild : false;
      const isDraggableRight = isPageRowChild ? !isLastChild : false;

      return [
        ...(isDraggableLeft ? [RECTANGLE_EDGE_LEFT] : []),
        ...(isDraggableRight ? [RECTANGLE_EDGE_RIGHT] : []),
      ] as RectangleEdge[];
    },
    [dom],
  );

  const handleEdgeDragStart = React.useCallback(
    (node: appDom.AppDomNode) =>
      (edge: RectangleEdge) =>
      (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();

        const parent = appDom.getParent(dom, node);

        const isPageColumnChild = parent ? appDom.isElement(parent) && isPageColumn(parent) : false;
        const isResizingVertically = edge === RECTANGLE_EDGE_TOP || edge === RECTANGLE_EDGE_BOTTOM;

        const nodeToResize = parent && isPageColumnChild && !isResizingVertically ? parent : node;

        api.edgeDragStart({ nodeId: nodeToResize.id, edge });

        selectNode(nodeToResize.id);
      },
    [api, dom, selectNode],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (selectedNodeId && event.key === 'Backspace') {
        handleNodeDelete(selectedNodeId)();
      }
    },
    [handleNodeDelete, selectedNodeId],
  );

  const isEmptyPage = pageNodes.length <= 1;

  /**
   * Return all nodes that are available for insertion.
   * i.e. Exclude all descendants of the current selection since inserting in one of
   * them would create a cyclic structure.
   */
  const availableDropTargets = React.useMemo((): appDom.AppDomNode[] => {
    if (!draggedNode) {
      return [];
    }

    let excludedNodes = new Set();

    if (selectedNode && !newNode) {
      excludedNodes = new Set<appDom.AppDomNode>([
        selectedNode,
        ...appDom.getDescendants(dom, selectedNode),
      ]);
    }

    if (isFormComponent(draggedNode)) {
      const formNodes = appDom.getComponentTypeNodes(dom, FORM_COMPONENT_ID);
      const formNodeDescendants = formNodes
        .map((formNode) => appDom.getDescendants(dom, formNode))
        .flat();

      formNodeDescendants.forEach(excludedNodes.add, excludedNodes);
    }

    return pageNodes.filter((n) => !excludedNodes.has(n));
  }, [dom, draggedNode, newNode, pageNodes, selectedNode]);

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

    const isDraggingOverLayoutChild =
      dragOverParent && dragOverParentFreeSlot
        ? appDom.isPage(dragOverParent) || dragOverParentFreeSlot.type === 'layout'
        : false;

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
      !isDraggingOverVerticalContainerChild ||
      isDraggingOverLayoutChild ||
      isDraggingOverPageColumnChild;
    const hasChildVerticalDropZones =
      !isDraggingOverHorizontalContainerChild ||
      isDraggingOverLayoutChild ||
      isDraggingOverPageRowChild;

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
        return [
          DROP_ZONE_TOP,
          DROP_ZONE_BOTTOM,
          DROP_ZONE_CENTER,
          ...((isDraggingOverLayoutChild ? [DROP_ZONE_LEFT, DROP_ZONE_RIGHT] : []) as DropZone[]),
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
              width:
                isPageChild && parentRect ? parentRect.x * 2 + parentRect.width : baseRect.width,
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

      const cursorPos = bridge?.canvasCommands.getViewCoordinates(event.clientX, event.clientY);

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
        if (isDraggingOverElement && activeDropNodeInfo) {
          const isDraggingOverPageChild = activeDropNodeParent
            ? appDom.isPage(activeDropNodeParent)
            : false;

          if (!activeDropSlot || isHorizontalFlow(activeDropSlot.flowDirection)) {
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
            } else if (relativeY <= edgeDetectionMargin && !isDraggingOverEmptyContainer) {
              activeDropZone = DROP_ZONE_TOP;
            } else if (
              activeDropAreaRect.height - relativeY <= edgeDetectionMargin &&
              !isDraggingOverEmptyContainer
            ) {
              activeDropZone = DROP_ZONE_BOTTOM;
            } else if (activeDropSlot) {
              activeDropZone = DROP_ZONE_CENTER;
            }
          }
          if (
            activeDropSlot &&
            !isDraggingOverEmptyContainer &&
            isVerticalFlow(activeDropSlot.flowDirection)
          ) {
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
          parentProp: activeDropSlotParentProp as appDom.ParentProp<
            appDom.ElementNode | appDom.PageNode
          >,
          zone: activeDropZone as DropZone,
        });
      }
    },
    [
      bridge,
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
      const cursorPos = bridge?.canvasCommands.getViewCoordinates(event.clientX, event.clientY);

      if (
        !draggedNode ||
        !cursorPos ||
        !dragOverNodeId ||
        !dragOverZone ||
        !availableDropZones.includes(dragOverZone)
      ) {
        return;
      }

      let dragOverNode = appDom.getNode(dom, dragOverNodeId) as appDom.ElementNode;

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

      const isDraggingOverLayout =
        dragOverNode && dragOverSlot
          ? appDom.isPage(dragOverNode) || dragOverSlot.type === 'layout'
          : false;
      const isDraggingOverElement = appDom.isElement(dragOverNode);

      appStateApi.update(
        (draft) => {
          let parent = appDom.getParent(draft, dragOverNode);

          const originalParent = parent;
          const originalParentInfo = parent && nodesInfo[parent.id];

          const originalParentFreeSlots = originalParentInfo?.slots;
          const originalParentFreeSlot =
            originalParentFreeSlots &&
            dragOverNodeParentProp &&
            originalParentFreeSlots[dragOverNodeParentProp];

          const isOriginalParentLayout =
            originalParent && originalParentFreeSlot
              ? appDom.isPage(originalParent) || originalParentFreeSlot.type === 'layout'
              : false;

          const isOriginalParentRow =
            originalParent && appDom.isElement(originalParent) ? isPageRow(originalParent) : false;
          const isOriginalParentColumn =
            originalParent && appDom.isElement(originalParent)
              ? isPageColumn(originalParent)
              : false;

          const isMovingNode = selectedNodeId && !newNode;

          let addOrMoveNode = appDom.addNode;
          if (isMovingNode) {
            addOrMoveNode = appDom.moveNode;
          }

          // Drop on page or layout slot
          if (isDraggingOverLayout && dragOverSlotParentProp) {
            const newParentIndex =
              dragOverZone === DROP_ZONE_TOP
                ? appDom.getNewFirstParentIndexInNode(draft, dragOverNode, dragOverSlotParentProp)
                : appDom.getNewLastParentIndexInNode(draft, dragOverNode, dragOverSlotParentProp);

            draft = addOrMoveNode(
              draft,
              draggedNode,
              dragOverNode,
              dragOverSlotParentProp,
              newParentIndex,
            );
          }

          if (
            isDraggingOverElement &&
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
              draft = addOrMoveNode(draft, draggedNode, dragOverNode, dragOverSlotParentProp);
            }

            if ([DROP_ZONE_TOP, DROP_ZONE_BOTTOM].includes(dragOverZone)) {
              if (!isDraggingOverVerticalContainer) {
                const newParentIndex =
                  dragOverZone === DROP_ZONE_TOP
                    ? appDom.getNewParentIndexBeforeNode(
                        draft,
                        dragOverNode,
                        dragOverNodeParentProp,
                      )
                    : appDom.getNewParentIndexAfterNode(
                        draft,
                        dragOverNode,
                        dragOverNodeParentProp,
                      );

                if (isDraggingOverRow && !isPageRow(draggedNode)) {
                  draft = addOrMoveNode(
                    draft,
                    draggedNode,
                    parent,
                    dragOverNodeParentProp,
                    newParentIndex,
                  );
                }

                if (isOriginalParentRow) {
                  const columnContainer = appDom.createElement(
                    draft,
                    PAGE_COLUMN_COMPONENT_ID,
                    {},
                    {
                      columnSize: dragOverNode.layout?.columnSize || 1,
                    },
                  );

                  draft = appDom.setNodeNamespacedProp(
                    draft,
                    dragOverNode,
                    'layout',
                    'columnSize',
                    1,
                  );
                  dragOverNode = appDom.getNode(draft, dragOverNodeId) as appDom.ElementNode;

                  draft = appDom.addNode(
                    draft,
                    columnContainer,
                    parent,
                    dragOverNodeParentProp,
                    appDom.getNewParentIndexAfterNode(draft, dragOverNode, dragOverNodeParentProp),
                  );
                  parent = columnContainer;

                  // Move existing element inside column right away if drag over zone is bottom
                  if (dragOverZone === DROP_ZONE_BOTTOM) {
                    draft = appDom.moveNode(draft, dragOverNode, parent, dragOverNodeParentProp);
                  }
                }

                if (!isDraggingOverRow || isPageRow(draggedNode)) {
                  draft = addOrMoveNode(
                    draft,
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
                  draft = appDom.moveNode(draft, dragOverNode, parent, dragOverNodeParentProp);
                }
              }

              if (dragOverSlotParentProp && isDraggingOverVerticalContainer) {
                const isDraggingOverDirectionStart =
                  dragOverZone ===
                  (dragOverSlot?.flowDirection === 'column' ? DROP_ZONE_TOP : DROP_ZONE_BOTTOM);

                const newParentIndex = isDraggingOverDirectionStart
                  ? appDom.getNewFirstParentIndexInNode(draft, dragOverNode, dragOverSlotParentProp)
                  : appDom.getNewLastParentIndexInNode(draft, dragOverNode, dragOverSlotParentProp);

                draft = addOrMoveNode(
                  draft,
                  draggedNode,
                  dragOverNode,
                  dragOverSlotParentProp,
                  newParentIndex,
                );
              }
            }

            if ([DROP_ZONE_RIGHT, DROP_ZONE_LEFT].includes(dragOverZone)) {
              if (!isDraggingOverHorizontalContainer) {
                const hasNewPageRow = isOriginalParentLayout || isOriginalParentColumn;

                if (hasNewPageRow) {
                  const rowContainer = appDom.createElement(draft, PAGE_ROW_COMPONENT_ID, {
                    justifyContent: originalParentInfo?.props.alignItems || 'start',
                  });
                  draft = appDom.addNode(
                    draft,
                    rowContainer,
                    parent,
                    dragOverNodeParentProp,
                    appDom.getNewParentIndexAfterNode(draft, dragOverNode, dragOverNodeParentProp),
                  );
                  parent = rowContainer;

                  // Move existing element inside right away if drag over zone is right
                  if (dragOverZone === DROP_ZONE_RIGHT) {
                    draft = appDom.moveNode(draft, dragOverNode, parent, 'children');
                  }
                }

                const newParentIndex =
                  dragOverZone === DROP_ZONE_RIGHT
                    ? appDom.getNewParentIndexAfterNode(draft, dragOverNode, dragOverNodeParentProp)
                    : appDom.getNewParentIndexBeforeNode(
                        draft,
                        dragOverNode,
                        dragOverNodeParentProp,
                      );

                draft = addOrMoveNode(
                  draft,
                  draggedNode,
                  parent,
                  hasNewPageRow ? 'children' : dragOverNodeParentProp,
                  newParentIndex,
                );

                // Only move existing element inside page/column in the end if drag over zone is left
                if (hasNewPageRow && dragOverZone === DROP_ZONE_LEFT) {
                  draft = appDom.moveNode(draft, dragOverNode, parent, 'children');
                }
              }

              if (dragOverSlotParentProp && isDraggingOverHorizontalContainer) {
                const isDraggingOverDirectionStart =
                  dragOverZone ===
                  (dragOverSlot?.flowDirection === 'row' ? DROP_ZONE_LEFT : DROP_ZONE_RIGHT);

                const newParentIndex = isDraggingOverDirectionStart
                  ? appDom.getNewFirstParentIndexInNode(draft, dragOverNode, dragOverSlotParentProp)
                  : appDom.getNewLastParentIndexInNode(draft, dragOverNode, dragOverSlotParentProp);

                draft = addOrMoveNode(
                  draft,
                  draggedNode,
                  dragOverNode,
                  dragOverSlotParentProp,
                  newParentIndex,
                );
              }
            }

            const draggedNodeParent = isMovingNode ? appDom.getParent(draft, draggedNode) : null;
            if (
              draggedNode.layout?.columnSize &&
              draggedNodeParent &&
              originalParent &&
              draggedNodeParent.id !== originalParent.id
            ) {
              draft = appDom.setNodeNamespacedProp(draft, draggedNode, 'layout', 'columnSize', 1);
            }
          }

          if (isMovingNode) {
            draft = deleteOrphanedLayoutNodes(dom, draft, draggedNode, dragOverNodeId);
          }

          return normalizePageRowColumnSizes(draft, pageNode);
        },
        currentView.kind === 'page'
          ? { ...omit(currentView, 'pageViewTab'), selectedNodeId: newNode?.id || draggedNodeId }
          : currentView,
      );

      api.dragEnd();

      if (newNode) {
        // Refocus on overlay so that keyboard events can keep being caught by it
        const overlayElement = overlayRef.current;
        invariant(overlayElement, 'Overlay ref not bound');
        overlayElement.focus();
      }
    },
    [
      api,
      appStateApi,
      availableDropZones,
      bridge?.canvasCommands,
      currentView,
      dom,
      dragOverNodeId,
      dragOverSlotParentProp,
      dragOverZone,
      draggedNode,
      draggedNodeId,
      newNode,
      nodesInfo,
      pageNode,
      selectedNodeId,
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

      const resizePreviewElement = resizePreviewElementRef.current;
      const draggedNodeInfo = nodesInfo[draggedNode.id];
      const draggedNodeRect = draggedNodeInfo?.rect;

      const parent = draggedNode && appDom.getParent(dom, draggedNode);

      const parentInfo = parent ? nodesInfo[parent.id] : null;
      const parentRect = parentInfo?.rect;

      const cursorPos = bridge?.canvasCommands.getViewCoordinates(event.clientX, event.clientY);

      const previousSibling = appDom.getSiblingBeforeNode(dom, draggedNode, 'children');
      const previousSiblingInfo = previousSibling && nodesInfo[previousSibling.id];
      const previousSiblingRect = previousSiblingInfo?.rect;

      if (draggedNodeRect && parentRect && resizePreviewElement && cursorPos) {
        if (draggedEdge === RECTANGLE_EDGE_LEFT || draggedEdge === RECTANGLE_EDGE_RIGHT) {
          let snappedToGridCursorRelativePosX = cursorPos.x - draggedNodeRect.x;

          const activeSnapGridColumnEdges =
            draggedEdge === RECTANGLE_EDGE_LEFT
              ? overlayGridRef.current.getLeftColumnEdges()
              : overlayGridRef.current.getRightColumnEdges();

          const minGridColumnWidth = overlayGridRef.current.getMinColumnWidth();

          for (const gridColumnEdge of activeSnapGridColumnEdges) {
            if (Math.abs(gridColumnEdge - cursorPos.x) <= minGridColumnWidth) {
              snappedToGridCursorRelativePosX = gridColumnEdge - draggedNodeRect.x;
            }
          }

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

        const defaultMinimumResizableHeight = 16;

        const minimumVerticalResizeHeight =
          draggedNodeInfo.componentConfig?.minimumLayoutHeight ?? defaultMinimumResizableHeight;

        const previousSiblingMinimumVerticalResizeHeight =
          previousSiblingInfo?.componentConfig?.minimumLayoutHeight ??
          defaultMinimumResizableHeight;

        if (
          draggedEdge === RECTANGLE_EDGE_BOTTOM &&
          cursorPos.y > draggedNodeRect.y + minimumVerticalResizeHeight
        ) {
          const snappedToGridCursorRelativePosY =
            Math.ceil((cursorPos.y - draggedNodeRect.y) / VERTICAL_RESIZE_SNAP_UNITS) *
            VERTICAL_RESIZE_SNAP_UNITS;

          const updatedTransformScale = snappedToGridCursorRelativePosY / draggedNodeRect.height;

          resizePreviewElement.style.transformOrigin = '50% 0';
          resizePreviewElement.style.transform = `scaleY(${updatedTransformScale})`;
        }

        if (
          draggedEdge === RECTANGLE_EDGE_TOP &&
          cursorPos.y < draggedNodeRect.y + draggedNodeRect.height - minimumVerticalResizeHeight &&
          (!previousSiblingRect ||
            cursorPos.y >
              draggedNodeRect.y -
                previousSiblingRect.height +
                previousSiblingMinimumVerticalResizeHeight)
        ) {
          const snappedToGridCursorRelativePosY =
            Math.ceil(
              (draggedNodeRect.y + draggedNodeRect.height - cursorPos.y) /
                VERTICAL_RESIZE_SNAP_UNITS,
            ) * VERTICAL_RESIZE_SNAP_UNITS;

          const updatedTransformScale = snappedToGridCursorRelativePosY / draggedNodeRect.height;

          resizePreviewElement.style.transformOrigin = '50% 100%';
          resizePreviewElement.style.transform = `scaleY(${updatedTransformScale})`;
        }
      }
    },
    [bridge, dom, draggedEdge, draggedNode, nodesInfo],
  );

  const handleEdgeDragEnd = React.useCallback(
    (event: React.MouseEvent<Element>) => {
      event.preventDefault();

      if (!draggedNode) {
        return;
      }

      const draggedNodeInfo = nodesInfo[draggedNode.id];
      const draggedNodeRect = draggedNodeInfo?.rect;

      const resizePreviewElement = resizePreviewElementRef.current;
      const resizePreviewRect = resizePreviewElement?.getBoundingClientRect();

      if (draggedNodeRect && resizePreviewRect) {
        domApi.update((draft) => {
          const previousSibling = appDom.getSiblingBeforeNode(draft, draggedNode, 'children');

          let previousSiblingInfo = null;
          let previousSiblingRect = null;
          if (previousSibling) {
            previousSiblingInfo = nodesInfo[previousSibling.id];
            previousSiblingRect = previousSiblingInfo?.rect;
          }

          if (draggedEdge === RECTANGLE_EDGE_LEFT || draggedEdge === RECTANGLE_EDGE_RIGHT) {
            if (draggedEdge === RECTANGLE_EDGE_LEFT) {
              if (previousSibling && previousSiblingRect) {
                const totalResizedColumnsSize =
                  (draggedNode.layout?.columnSize || 1) + (previousSibling.layout?.columnSize || 1);
                const totalResizedColumnsWidth = draggedNodeRect.width + previousSiblingRect.width;

                const updatedDraggedNodeColumnSize =
                  (resizePreviewRect.width / totalResizedColumnsWidth) * totalResizedColumnsSize;
                const updatedPreviousSiblingColumnSize =
                  totalResizedColumnsSize - updatedDraggedNodeColumnSize;

                draft = appDom.setNodeNamespacedProp(
                  draft,
                  draggedNode,
                  'layout',
                  'columnSize',
                  updatedDraggedNodeColumnSize,
                );
                draft = appDom.setNodeNamespacedProp(
                  draft,
                  previousSibling,
                  'layout',
                  'columnSize',
                  updatedPreviousSiblingColumnSize,
                );
              }
            }
            if (draggedEdge === RECTANGLE_EDGE_RIGHT) {
              const nextSibling = appDom.getSiblingAfterNode(draft, draggedNode, 'children');

              if (nextSibling) {
                const nextSiblingInfo = nodesInfo[nextSibling.id];
                const nextSiblingRect = nextSiblingInfo?.rect;

                if (nextSiblingRect) {
                  const totalResizedColumnsSize =
                    (draggedNode.layout?.columnSize || 1) + (nextSibling.layout?.columnSize || 1);
                  const totalResizedColumnsWidth = draggedNodeRect.width + nextSiblingRect.width;

                  const updatedDraggedNodeColumnSize =
                    (resizePreviewRect.width / totalResizedColumnsWidth) * totalResizedColumnsSize;
                  const updatedNextSiblingColumnSize =
                    totalResizedColumnsSize - updatedDraggedNodeColumnSize;

                  draft = appDom.setNodeNamespacedProp(
                    draft,
                    draggedNode,
                    'layout',
                    'columnSize',
                    updatedDraggedNodeColumnSize,
                  );
                  draft = appDom.setNodeNamespacedProp(
                    draft,
                    nextSibling,
                    'layout',
                    'columnSize',
                    updatedNextSiblingColumnSize,
                  );
                }
              }
            }
          }

          if (draggedEdge === RECTANGLE_EDGE_BOTTOM || draggedEdge === RECTANGLE_EDGE_TOP) {
            const isValidTopResize =
              draggedEdge === RECTANGLE_EDGE_TOP &&
              previousSibling &&
              previousSiblingRect &&
              !isPageRow(previousSibling);

            if (draggedEdge === RECTANGLE_EDGE_BOTTOM || isValidTopResize) {
              draft = appDom.setNodeNamespacedProp(
                draft,
                draggedNode,
                'layout',
                'height',
                resizePreviewRect.height,
              );
            }

            if (isValidTopResize && previousSiblingRect) {
              draft = appDom.setNodeNamespacedProp(
                draft,
                previousSibling,
                'layout',
                'height',
                previousSiblingRect.height + (draggedNodeRect.height - resizePreviewRect.height),
              );
            }
          }

          return draft;
        });
      }

      api.dragEnd();
    },
    [api, domApi, draggedEdge, draggedNode, nodesInfo],
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
        const nodeInfo = nodesInfo[node.id];
        const nodeRect = nodeInfo?.rect || null;

        const parent = appDom.getParent(dom, node);

        const isPageNode = appDom.isPage(node);
        const isElementNode = appDom.isElement(node);

        const isPageRowChild = parent ? appDom.isElement(parent) && isPageRow(parent) : false;
        const isPageColumnChild = parent ? appDom.isElement(parent) && isPageColumn(parent) : false;

        // @TODO: Improve solution for resizing from top, it's still not a great UX
        // const nodeParentProp = node.parentProp;
        // const isFirstChild =
        //   parent && appDom.isElement(parent) && nodeParentProp
        //     ? appDom.getNodeFirstChild(dom, parent, nodeParentProp)?.id === node.id
        //     : false;

        const isSelected = selectedNode && !newNode ? selectedNode.id === node.id : false;
        const isHovered = hoveredNodeId === node.id;

        const isHorizontallyResizable = isPageRowChild || isPageColumnChild;

        const nodeComponentId = isElementNode ? getElementNodeComponentId(node) : null;

        // @TODO: Enable vertical resizing for all component types when there is a better solution for adjusting size of other elements in same row after resizing
        const isVerticallyResizable =
          isElementNode &&
          !isPageRow(node) &&
          !isPageColumn(node) &&
          (nodeComponentId === 'Chart' ||
            nodeComponentId === 'DataGrid' ||
            nodeComponentId === 'Spacer');

        const isResizing = Boolean(draggedEdge);
        const isResizingNode = isResizing && node.id === draggedNodeId;

        const isInteractive = interactiveNodes.has(node.id) && !isResizing && !isDraggingOver;

        if (!nodeRect) {
          return null;
        }

        return (
          <React.Fragment key={node.id}>
            {!isPageNode ? (
              <NodeHud
                node={node}
                rect={nodeRect}
                selectedNodeRect={selectedRect}
                isSelected={isSelected}
                isInteractive={isInteractive}
                onNodeDragStart={handleNodeDragStart(node as appDom.ElementNode)}
                onDuplicate={handleNodeDuplicate(node as appDom.ElementNode)}
                draggableEdges={[
                  ...(isHorizontallyResizable
                    ? getNodeDraggableHorizontalEdges(parent && isPageColumnChild ? parent : node)
                    : []),
                  ...(isVerticallyResizable
                    ? [
                        RECTANGLE_EDGE_BOTTOM as RectangleEdge,
                        // @TODO: Improve solution for resizing from top, it's still not a great UX
                        // ...(!isFirstChild ? [RECTANGLE_EDGE_TOP as RectangleEdge] : []),
                      ]
                    : []),
                ]}
                onEdgeDragStart={isSelected ? handleEdgeDragStart(node) : undefined}
                onDelete={handleNodeDelete(node.id)}
                isResizing={isResizingNode}
                resizePreviewElementRef={resizePreviewElementRef}
                isHovered={isHovered}
                isHoverable={!isResizing && !isDraggingOver}
                isOutlineVisible={isDraggingOver}
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
