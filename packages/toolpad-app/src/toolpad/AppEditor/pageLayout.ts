import { NodeId } from '@mui/toolpad-core';
import * as appDom from '@mui/toolpad-core/appDom';
import {
  getElementNodeComponentId,
  isPageColumn,
  isPageLayoutComponent,
  isPageRow,
} from '../../runtime/toolpadComponents';

export function deleteOrphanedLayoutNodes(
  domBeforeChange: appDom.AppDom,
  domAfterChange: appDom.AppDom,
  movedOrDeletedNode: appDom.ElementNode,
  moveTargetNodeId: NodeId | null = null,
): appDom.AppDom {
  let updatedDom = domAfterChange;
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

  if (isSecondLastLayoutContainerChild) {
    if (parent.parentIndex && parentParent) {
      const lastContainerChild = parentChildren.filter(
        (child) => child.id !== movedOrDeletedNode.id,
      )[0];

      if (
        lastContainerChild.parentProp &&
        parentParent.parentIndex &&
        moveTargetNodeId !== parentParent.id &&
        moveTargetNodeId !== lastContainerChild.id
      ) {
        if (
          moveTargetNodeId !== parent.id &&
          (appDom.isPage(parentParent) ||
            (appDom.isElement(parentParent) &&
              getElementNodeComponentId(lastContainerChild) !==
                getElementNodeComponentId(parentParent)))
        ) {
          updatedDom = appDom.moveNode(
            updatedDom,
            lastContainerChild,
            parentParent,
            (lastContainerChild.parentProp || 'children') as appDom.ParentPropOf<
              appDom.ElementNode<any>,
              appDom.PageNode | appDom.ElementNode<any>
            >,
            parent.parentIndex,
          );

          if (isPageColumn(parent)) {
            updatedDom = appDom.setNodeNamespacedProp(
              updatedDom,
              lastContainerChild,
              'layout',
              'columnSize',
              parent.layout?.columnSize || 1,
            );
          }

          orphanedLayoutNodeIds = [...orphanedLayoutNodeIds, parent.id];
        }

        if (
          parentParentParent &&
          appDom.isElement(parentParentParent) &&
          isPageLayoutComponent(parentParentParent) &&
          isParentOnlyLayoutContainerChild
        ) {
          updatedDom = appDom.moveNode(
            updatedDom,
            lastContainerChild,
            parentParentParent,
            lastContainerChild.parentProp,
            parentParent.parentIndex,
          );

          if (isPageColumn(parentParent)) {
            updatedDom = appDom.setNodeNamespacedProp(
              updatedDom,
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
    updatedDom = appDom.removeMaybeNode(updatedDom, nodeId);
  });

  return updatedDom;
}

export function normalizePageRowColumnSizes(
  dom: appDom.AppDom,
  pageNode: appDom.PageNode,
): appDom.AppDom {
  const allPageNodes = appDom.getDescendants(dom, pageNode);

  allPageNodes.forEach((node: appDom.AppDomNode) => {
    if (appDom.isElement(node) && isPageRow(node)) {
      const nodeChildren = appDom.getChildNodes(dom, node).children;
      const nodeChildrenCount = nodeChildren.length;

      const columnSizes = nodeChildren.map((child) => child.layout?.columnSize || 1);
      const totalColumnsSize = columnSizes.reduce((acc, size) => acc + size, 0);

      if (totalColumnsSize.toFixed(4) !== nodeChildrenCount.toFixed(4)) {
        const normalizedLayoutColumnSizes = columnSizes.map(
          (size) => (size * nodeChildren.length) / totalColumnsSize,
        );

        nodeChildren.forEach((child, childIndex) => {
          dom = appDom.setNodeNamespacedProp(
            dom,
            child,
            'layout',
            'columnSize',
            normalizedLayoutColumnSizes[childIndex],
          );
        });
      }
    }
  });

  return dom;
}

export function removePageLayoutNode(dom: appDom.AppDom, node: appDom.ElementNode): appDom.AppDom {
  const pageNode = appDom.getPageAncestor(dom, node);

  let updatedDom = dom;

  updatedDom = appDom.removeMaybeNode(updatedDom, node.id);
  updatedDom = deleteOrphanedLayoutNodes(dom, updatedDom, node);

  if (pageNode) {
    updatedDom = normalizePageRowColumnSizes(updatedDom, pageNode);
  }

  return updatedDom;
}
