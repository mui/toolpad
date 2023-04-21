import invariant from 'invariant';
import { mapValues } from '@mui/toolpad-utils/collections';
import * as appDom from '..';

function replaceLinkWithText(node: appDom.AppDomNode): appDom.AppDomNode {
  if (node.type === 'element' && node.attributes.component.value === 'Link') {
    return {
      ...node,
      attributes: {
        ...node.attributes,
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
