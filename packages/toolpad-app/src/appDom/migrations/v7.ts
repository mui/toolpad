import invariant from 'invariant';
import * as appDom from '..';
import { mapValues } from '../../utils/collections';

export default {
  up(dom: appDom.AppDom): appDom.AppDom {
    invariant(dom.version === 6, 'Can only migrate dom of version 6');

    return {
      ...dom,
      nodes: mapValues(dom.nodes, (node) => {
        if (node.type === 'page') {
          return {
            ...node,
            attributes: {
              ...node.attributes,
              isNew: {
                type: 'const' as const,
                value: true,
              },
            },
          };
        }

        return node;
      }),
      version: 6,
    };
  },
};
