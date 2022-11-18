import invariant from 'invariant';
import * as appDom from '..';
import { mapValues } from '../../utils/collections';

function replaceQueryParams(node: any): appDom.AppDomNode {
  if (node.type === 'query') {
    return {
      ...node,
      ...(node.params ? { params: Object.entries(node.params) } : {}),
    };
  }

  return node;
}

export default {
  up(dom: appDom.AppDom): appDom.AppDom {
    invariant(dom.version === 2, 'Can only migrate dom of version 2');
    return {
      ...dom,
      nodes: mapValues(dom.nodes, (node) => replaceQueryParams(node)),
      version: 3,
    };
  },
};
