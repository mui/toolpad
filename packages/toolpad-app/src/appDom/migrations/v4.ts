import invariant from 'invariant';
import { mapValues } from '@mui/toolpad-utils/collections';
import * as appDom from '..';

function replaceTypographyWithText(node: appDom.AppDomNode): appDom.AppDomNode {
  if (node.type === 'element' && node.attributes.component.value === 'Typography') {
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
    invariant(dom.version === 3, 'Can only migrate dom of version 3');
    return {
      ...dom,
      nodes: mapValues(dom.nodes, (node) => replaceTypographyWithText(node)),
      version: 4,
    };
  },
};
