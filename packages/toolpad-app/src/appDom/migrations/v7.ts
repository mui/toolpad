import invariant from 'invariant';
import { mapValues } from '@mui/toolpad-utils/collections';
import * as appDom from '..';

function updateBindingSyntax() {}

function updateBindingsSyntax(node: appDom.AppDomNode): appDom.AppDomNode {}

export default {
  up(dom: appDom.AppDom): appDom.AppDom {
    invariant(dom.version === 6, 'Can only migrate dom of version 5');

    return {
      ...dom,
      nodes: mapValues(dom.nodes, (node) => node),
      version: 7,
    };
  },
};
