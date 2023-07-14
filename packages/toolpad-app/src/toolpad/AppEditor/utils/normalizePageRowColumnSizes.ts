import { NodeId } from '@mui/toolpad-core';
import * as appDom from '../../../appDom';
import { isPageRow } from '../../../runtime/toolpadComponents';

const rowColumnCounts: Record<NodeId, number> = {};

export default function normalizePageRowColumnSizes(
  draftDom: appDom.AppDom,
  pageNode: appDom.PageNode | null,
) {
  if (!pageNode) {
    return draftDom;
  }
  const draftPageNodes = [pageNode, ...appDom.getDescendants(draftDom, pageNode)];

  draftPageNodes.forEach((node: appDom.AppDomNode) => {
    if (appDom.isElement(node) && isPageRow(node)) {
      const nodeChildren = appDom.getChildNodes(draftDom, node).children;
      const childrenCount = nodeChildren?.length || 0;

      const previousRowColumnCount = rowColumnCounts[node.id];

      if (
        previousRowColumnCount !== undefined &&
        childrenCount > 0 &&
        childrenCount &&
        childrenCount < previousRowColumnCount
      ) {
        const layoutColumnSizes = nodeChildren.map((child) => child.layout?.columnSize || 1);
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
              normalizedLayoutColumnSizes[childIndex],
            );
          }
        });
      }

      rowColumnCounts[node.id] = childrenCount;
    }
  });

  return draftDom;
}
