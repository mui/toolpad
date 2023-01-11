import invariant from 'invariant';
import * as appDom from '..';
import { mapValues } from '../../utils/collections';

function replaceLinkWithText(node: appDom.AppDomNode): appDom.AppDomNode {
  if (node.type === 'element' && node.attributes.component.value === 'Link') {
    return {
      ...node,
      attributes: {
        component: {
          ...node.attributes.component,
          value: 'Text',
        },
      },
    };
  }
  return node;
}

export default {
  up(dom: appDom.AppDom): appDom.AppDom {
    invariant(dom.version === 4, 'Can only migrate dom of version 4');
    return {
      ...dom,
      nodes: mapValues(dom.nodes, (node) => replaceLinkWithText(node)),
      version: 5,
    };
  },
};
