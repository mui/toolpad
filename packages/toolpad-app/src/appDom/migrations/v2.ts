import invariant from 'invariant';
import { mapValues } from '@mui/toolpad-utils/collections';
import * as appDom from '..';

function replaceMutation(node: any): appDom.AppDomNode {
  if (node.type === 'mutation') {
    return {
      ...node,
      type: 'query',
      parentProp: 'queries',
      attributes: {
        ...node.attributes,
        mode: appDom.createConst('mutation'),
      },
    };
  }

  return node;
}

export default {
  up(dom: appDom.AppDom): appDom.AppDom {
    invariant(dom.version === 1, 'Can only migrate dom of version 1');
    return {
      ...dom,
      nodes: mapValues(dom.nodes, (node) => replaceMutation(node)),
      version: 2,
    };
  },
};
