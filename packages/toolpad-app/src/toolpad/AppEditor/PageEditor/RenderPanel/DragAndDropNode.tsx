import * as React from 'react';

import { FlowDirection } from '../../../../types';
import * as appDom from '../../../../appDom';
import { Rectangle } from '../../../../utils/geometry';

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
  parentProp: string | null;
  dropAreaRect: Rectangle;
  availableDropZones: DropZone[];
}

export default function DragAndDropNode({
  node,
  parentProp,
  dropAreaRect,
  availableDropZones,
}: DragAndDropNodeProps) {
  const dom = useDom();
  const { dragOverNodeId, dragOverSlotParentProp, dragOverZone, viewState } = usePageEditorState();

  const { nodes: nodesInfo } = viewState;

  const dropAreaNodeInfo = nodesInfo[node.id];

  const dropAreaNodeRect = dropAreaNodeInfo?.rect || null;
  const dropAreaNodeSlots = dropAreaNodeInfo?.slots;

  const hasMultipleFreeSlots = dropAreaNodeSlots
    ? Object.keys(dropAreaNodeSlots).length > 1
    : false;

  const dropAreaNodeParent = appDom.getParent(dom, node);
  const dropAreaNodeParentInfo = dropAreaNodeParent && nodesInfo[dropAreaNodeParent.id];

  const isPageNode = appDom.isPage(node);
  const isPageChild = dropAreaNodeParent ? appDom.isPage(dropAreaNodeParent) : false;
  const isPageRowChild = dropAreaNodeParent
    ? appDom.isElement(dropAreaNodeParent) && isPageRow(dropAreaNodeParent)
    : false;

  const dropAreaNodeChildNodes = React.useMemo(
    () => appDom.getChildNodes(dom, node) as appDom.NodeChildren<appDom.ElementNode>,
    [dom, node],
  );

  const getNodeDropAreaHighlightedZone = React.useCallback((): DropZone | null => {
    const dropAreaParentParent = dropAreaNodeParent && appDom.getParent(dom, dropAreaNodeParent);

    if (dragOverZone && !availableDropZones.includes(dragOverZone)) {
      return null;
    }

    if (dragOverZone === DROP_ZONE_TOP) {
      // Is dragging over page top
      if (
        dropAreaNodeParent &&
        dropAreaNodeParent.id === dragOverNodeId &&
        appDom.isPage(dropAreaNodeParent)
      ) {
        const pageFirstChild = appDom.getNodeFirstChild(dom, dropAreaNodeParent, 'children');

        const isPageFirstChild = pageFirstChild ? node.id === pageFirstChild.id : false;

        return isPageFirstChild ? DROP_ZONE_TOP : null;
      }
    }

    if (dragOverZone === DROP_ZONE_LEFT) {
      // Is dragging over parent page row left, and parent page row is a child of the page
      if (
        dropAreaNodeParent &&
        dropAreaParentParent &&
        dropAreaNodeParent.id === dragOverNodeId &&
        appDom.isElement(dropAreaNodeParent) &&
        isPageRowChild &&
        appDom.isPage(dropAreaParentParent)
      ) {
        const parentFirstChild = parentProp
          ? appDom.getNodeFirstChild(dom, dropAreaNodeParent, parentProp)
          : null;

        const isParentFirstChild = parentFirstChild ? node.id === parentFirstChild.id : false;

        return isParentFirstChild ? DROP_ZONE_LEFT : null;
      }

      // Is dragging over left, is page row and child of the page
      if (dropAreaNodeParent && appDom.isElement(node) && isPageRow(node) && isPageChild) {
        return null;
      }
    }

    if (dragOverZone === DROP_ZONE_CENTER) {
      // Is dragging over parent element center
      if (dropAreaNodeParent && dropAreaNodeParent.id === dragOverNodeId) {
        const parentLastChild =
          parentProp && (appDom.isPage(dropAreaNodeParent) || appDom.isElement(dropAreaNodeParent))
            ? appDom.getNodeLastChild(dom, dropAreaNodeParent, parentProp)
            : null;

        const isParentLastChild = parentLastChild ? node.id === parentLastChild.id : false;

        const parentSlots = dropAreaNodeParentInfo?.slots || null;

        const parentFlowDirection =
          parentSlots && parentProp && parentSlots[parentProp]?.flowDirection;

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
          (parentProp && appDom.isElement(node) && dropAreaNodeChildNodes[parentProp]) || [];
        return nodeChildren.length === 0 ? DROP_ZONE_CENTER : null;
      }
    }

    // Common cases
    return node.id === dragOverNodeId && parentProp === dragOverSlotParentProp
      ? dragOverZone
      : null;
  }, [
    dropAreaNodeParent,
    dom,
    dragOverZone,
    availableDropZones,
    node,
    dragOverNodeId,
    parentProp,
    dragOverSlotParentProp,
    isPageRowChild,
    isPageChild,
    dropAreaNodeParentInfo?.slots,
    hasMultipleFreeSlots,
    isPageNode,
    dropAreaNodeChildNodes,
  ]);

  const slotRect = (dropAreaNodeSlots && parentProp && dropAreaNodeSlots[parentProp]?.rect) || null;

  const dropAreaSlotChildNodes = parentProp ? dropAreaNodeChildNodes[parentProp] || [] : [];
  const isEmptySlot = dropAreaSlotChildNodes.length === 0;

  if (!node || !dropAreaNodeParentInfo || !dropAreaNodeRect) {
    return null;
  }

  return (
    <NodeDropArea
      node={node}
      parentInfo={dropAreaNodeParentInfo}
      layoutRect={dropAreaNodeRect}
      dropAreaRect={dropAreaRect}
      slotRect={slotRect}
      highlightedZone={getNodeDropAreaHighlightedZone()}
      isEmptySlot={isEmptySlot}
      isPageChild={isPageChild}
    />
  );
}
