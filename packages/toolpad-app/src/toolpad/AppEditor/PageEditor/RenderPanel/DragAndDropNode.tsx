import * as React from 'react';
import { NodeId } from '@mui/toolpad-core';

import { SlotsState, FlowDirection } from '../../../../types';
import * as appDom from '../../../../appDom';
import { Rectangle } from '../../../../utils/geometry';
import { ExactEntriesOf } from '../../../../utils/types';

import { useDom } from '../../../DomLoader';

import NodeDropArea from './NodeDropArea';
import {
  DROP_ZONE_CENTER,
  DROP_ZONE_BOTTOM,
  DROP_ZONE_LEFT,
  DROP_ZONE_RIGHT,
  DROP_ZONE_TOP,
  DropZone,
  usePageEditorState,
} from '../PageEditorProvider';
import { isPageRow } from '../../../../toolpadComponents';

function getChildNodeHighlightedZone(parentFlowDirection: FlowDirection): DropZone | null {
  switch (parentFlowDirection) {
    case 'row':
      return DROP_ZONE_RIGHT;
    case 'column':
      return DROP_ZONE_BOTTOM;
    case 'row-reverse':
      return DROP_ZONE_LEFT;
    case 'column-reverse':
      return DROP_ZONE_TOP;
    default:
      return null;
  }
}

interface DragAndDropNodeProps {
  node: appDom.AppDomNode;
  getDropAreaRect: (nodeId: NodeId, parentProp?: string) => Rectangle;
  availableDropZones: DropZone[];
}

export default function DragAndDropNode({
  node,
  getDropAreaRect,
  availableDropZones,
}: DragAndDropNodeProps) {
  const dom = useDom();
  const { dragOverNodeId, dragOverSlotParentProp, dragOverZone, viewState } = usePageEditorState();

  const { nodes: nodesInfo } = viewState;

  const nodeInfo = nodesInfo[node.id];
  const nodeParentProp = node.parentProp;

  const parent = appDom.getParent(dom, node) as appDom.PageNode | appDom.ElementNode;
  const parentInfo = (parent && nodesInfo[parent.id]) || null;

  const isPageNode = appDom.isPage(node);
  const isPageChild = parent ? appDom.isPage(parent) : false;

  const isPageRowChild = parent ? appDom.isElement(parent) && isPageRow(parent) : false;

  const childNodes = appDom.getChildNodes(dom, node) as appDom.NodeChildren<appDom.ElementNode>;

  const freeSlots = nodeInfo?.slots || {};
  const freeSlotEntries = Object.entries(freeSlots) as ExactEntriesOf<SlotsState>;

  const hasFreeSlots = freeSlotEntries.length > 0;
  const hasMultipleFreeSlots = freeSlotEntries.length > 1;

  const getNodeDropAreaHighlightedZone = React.useCallback(
    (parentProp: string | null = null): DropZone | null => {
      const parentParent = parent && appDom.getParent(dom, parent);

      if (dragOverZone && !availableDropZones.includes(dragOverZone)) {
        return null;
      }

      if (dragOverZone === DROP_ZONE_TOP) {
        // Is dragging over page top
        if (parent && parent.id === dragOverNodeId && appDom.isPage(parent)) {
          const pageFirstChild = appDom.getNodeFirstChild(dom, parent, 'children');

          const isPageFirstChild = pageFirstChild ? node.id === pageFirstChild.id : false;

          return isPageFirstChild ? DROP_ZONE_TOP : null;
        }
      }

      if (dragOverZone === DROP_ZONE_LEFT) {
        // Is dragging over parent page row left, and parent page row is a child of the page
        if (
          parent &&
          parentParent &&
          parent.id === dragOverNodeId &&
          appDom.isElement(parent) &&
          isPageRowChild &&
          appDom.isPage(parentParent)
        ) {
          const parentFirstChild = nodeParentProp
            ? appDom.getNodeFirstChild(dom, parent, nodeParentProp)
            : null;

          const isParentFirstChild = parentFirstChild ? node.id === parentFirstChild.id : false;

          return isParentFirstChild ? DROP_ZONE_LEFT : null;
        }

        // Is dragging over left, is page row and child of the page
        if (parent && appDom.isElement(node) && isPageRow(node) && isPageChild) {
          return null;
        }
      }

      if (dragOverZone === DROP_ZONE_CENTER) {
        // Is dragging over parent element center
        if (parent && parent.id === dragOverNodeId) {
          const parentLastChild =
            nodeParentProp && (appDom.isPage(parent) || appDom.isElement(parent))
              ? appDom.getNodeLastChild(dom, parent, nodeParentProp)
              : null;

          const isParentLastChild = parentLastChild ? node.id === parentLastChild.id : false;

          const parentSlots = parentInfo?.slots || null;

          const parentFlowDirection =
            parentSlots && nodeParentProp && parentSlots[nodeParentProp]?.flowDirection;

          return parentFlowDirection && isParentLastChild && (!hasMultipleFreeSlots || !parentProp)
            ? getChildNodeHighlightedZone(parentFlowDirection)
            : null;
        }
        // Is dragging over slot center
        if (node.id === dragOverNodeId && parentProp && parentProp === dragOverSlotParentProp) {
          if (isPageNode) {
            return DROP_ZONE_CENTER;
          }

          const nodeChildren =
            (parentProp && appDom.isElement(node) && childNodes[parentProp]) || [];
          return nodeChildren.length === 0 ? DROP_ZONE_CENTER : null;
        }
      }

      // Common cases
      return node.id === dragOverNodeId && parentProp === dragOverSlotParentProp
        ? dragOverZone
        : null;
    },
    [
      availableDropZones,
      childNodes,
      dom,
      dragOverNodeId,
      dragOverSlotParentProp,
      dragOverZone,
      hasMultipleFreeSlots,
      isPageChild,
      isPageNode,
      isPageRowChild,
      node,
      nodeParentProp,
      parent,
      parentInfo?.slots,
    ],
  );

  const nodeRect = nodeInfo?.rect || null;
  const hasNodeOverlay = isPageNode || appDom.isElement(node);

  if (!nodeRect || !hasNodeOverlay) {
    return null;
  }

  const hasOwnDropArea = !hasFreeSlots || hasMultipleFreeSlots;
  const hasSlotDropAreas = hasFreeSlots;

  return (
    <React.Fragment>
      {hasSlotDropAreas
        ? freeSlotEntries.map(([parentProp, freeSlot]) => {
            if (!freeSlot) {
              return null;
            }

            const dropAreaRect = getDropAreaRect(node.id, parentProp);

            const slotChildNodes = childNodes[parentProp] || [];
            const isEmptySlot = slotChildNodes.length === 0;

            if (isPageNode && !isEmptySlot) {
              return null;
            }

            return (
              <NodeDropArea
                key={`${node.id}:${parentProp}`}
                node={node}
                parentInfo={parentInfo}
                layoutRect={nodeRect}
                dropAreaRect={dropAreaRect}
                slotRect={freeSlot.rect}
                highlightedZone={getNodeDropAreaHighlightedZone(parentProp)}
                isEmptySlot={isEmptySlot}
                isPageChild={isPageChild}
              />
            );
          })
        : null}
      {hasOwnDropArea ? (
        <NodeDropArea
          node={node}
          parentInfo={parentInfo}
          layoutRect={nodeRect}
          dropAreaRect={getDropAreaRect(node.id)}
          highlightedZone={getNodeDropAreaHighlightedZone()}
          isEmptySlot={false}
          isPageChild={isPageChild}
        />
      ) : null}
    </React.Fragment>
  );
}
