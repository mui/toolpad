import { NodeId } from '@mui/toolpad-core';
import * as appDom from '../../../appDom';
import { isPageLayoutComponent, isPageRow, isPageColumn } from '../../../runtime/toolpadComponents';

export default function deleteOrphanedLayoutNodes(
  domBeforeChange: appDom.AppDom,
  domAfterChange: appDom.AppDom,
  movedOrDeletedNode: appDom.ElementNode,
  moveTargetNodeId: NodeId | null = null,
): appDom.AppDom {
  let draftDom = domAfterChange;
  let orphanedLayoutNodeIds: NodeId[] = [];

  const movedOrDeletedNodeParentProp = movedOrDeletedNode.parentProp;

  const parent = appDom.getParent(domBeforeChange, movedOrDeletedNode);
  const parentParent = parent && appDom.getParent(domBeforeChange, parent);
  const parentParentParent = parentParent && appDom.getParent(domBeforeChange, parentParent);

  const parentChildren =
    parent && movedOrDeletedNodeParentProp
      ? (appDom.getChildNodes(domBeforeChange, parent) as appDom.NodeChildren<appDom.ElementNode>)[
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
    appDom.getChildNodes(domBeforeChange, parentParent)[parent.parentProp].length === 1;

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
          parentParent.parentIndex &&
          parentParentParent &&
          appDom.isElement(parentParentParent) &&
          isPageLayoutComponent(parentParentParent) &&
          isParentOnlyLayoutContainerChild &&
          moveTargetNodeId !== parentParent.id &&
          moveTargetNodeId !== lastContainerChild.id
        ) {
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
                parent.layout?.columnSize || 1,
              );
            }

            orphanedLayoutNodeIds = [...orphanedLayoutNodeIds, parent.id];
          }

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
              parentParent.layout?.columnSize || 1,
            );
          }

          orphanedLayoutNodeIds = [...orphanedLayoutNodeIds, parentParent.id];
        }
      }
    }
  }

  if (isOnlyLayoutContainerChild) {
    if (isParentOnlyLayoutContainerChild && moveTargetNodeId !== parentParent.id) {
      orphanedLayoutNodeIds = [...orphanedLayoutNodeIds, parentParent.id];
    }

    orphanedLayoutNodeIds = [...orphanedLayoutNodeIds, parent.id];
  }

  orphanedLayoutNodeIds.forEach((nodeId) => {
    draftDom = appDom.removeMaybeNode(draftDom, nodeId);
  });

  return draftDom;
}
