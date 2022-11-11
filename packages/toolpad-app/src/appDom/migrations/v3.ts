import invariant from 'invariant';
import * as appDom from '..';
import { mapValues } from '../../utils/collections';

// function replaceQueryParams(node: any): appDom.AppDomNode {
//   if (node.type === 'query') {
//     return {
//       ...node,
//       params: node.params ? Object.entries(node.params) : undefined,
//     };
//   }

//   return node;
// }

function replaceTypographyAndLinkWithText(node: any): appDom.AppDomNode {
  if (node.type === 'element') {
    return {
      name: node.name.replace(/Typography|Link/gi, 'text'),
      attributes: {
        component: {
          ...node.attributes.component,
          value: 'Text',
        },
      },
      ...node,
    };
  }
  return node;
}

export default {
  up(dom: appDom.AppDom): appDom.AppDom {
    invariant(dom.version === 2, 'Can only migrate dom of version 2');
    return {
      ...dom,
      nodes: mapValues(dom.nodes, (node) => replaceTypographyAndLinkWithText(node)),
      version: 3,
    };
  },
};
