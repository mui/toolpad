import invariant from 'invariant';
import { mapValues } from '@mui/toolpad-utils/collections';
import * as appDom from '..';

function replaceQueryParams(node: any): appDom.AppDomNode {
  if (node.type === 'query') {
    return {
      ...node,
      params: node.params && !Array.isArray(node.params) ? Object.entries(node.params) : [],
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
