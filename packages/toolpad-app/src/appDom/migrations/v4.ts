import invariant from 'invariant';
import * as appDom from '..';
import { mapValues } from '../../utils/collections';
import config from '../../config';

export const DEFAULT_TEMPLATE_DATA_URL = new URL('/static/employees.json', config.externalUrl).href;

function replaceDefaultDataStaticPath(node: appDom.AppDomNode): appDom.AppDomNode {
  if (node.type === 'query' && node.name === 'getUsers' && node.attributes.query) {
    return {
      ...node,
      attributes: {
        ...node.attributes,
        query: {
          ...node.attributes.query,
          value: {
            ...node.attributes.query.value,
            url: {
              type: 'const',
              value: DEFAULT_TEMPLATE_DATA_URL,
            },
          },
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
      nodes: mapValues(dom.nodes, (node) => replaceDefaultDataStaticPath(node)),
      version: 4,
    };
  },
};
