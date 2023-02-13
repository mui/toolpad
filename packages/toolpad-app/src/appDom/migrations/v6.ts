import { NodeId } from '@mui/toolpad-core';
import invariant from 'invariant';
import * as appDom from '..';
import { mapValues } from '../../utils/collections';

export default {
  up(dom: appDom.AppDom): appDom.AppDom {
    invariant(dom.version === 5, 'Can only migrate dom of version 4');

    const prefix = 'codeComponent.';
    return {
      ...dom,
      nodes: mapValues(dom.nodes, (node) => {
        if (node.type === 'element' && node.attributes.component.value.startsWith(prefix)) {
          const codeComponentId = node.attributes.component.value.slice(prefix.length);
          const codeComponent = dom.nodes[codeComponentId as NodeId];
          if (codeComponent) {
            return {
              ...node,
              attributes: {
                ...node.attributes,
                component: {
                  ...node.attributes.component,
                  value: `${prefix}${codeComponent}`,
                },
              },
            };
          }
        }
        if (
          node.type === 'element' &&
          node.attributes.component.value === 'DataGrid' &&
          node.props?.columns?.value
        ) {
          return {
            ...node,
            props: {
              ...node.props,
              columns: {
                ...node.attributes.component,
                value: node.props?.columns?.value?.map((column: any) => {
                  if (column.type === 'codeComponent') {
                    const codeComponentNode = dom.nodes[column.codeComponent];
                    return { ...column, codeComponent: codeComponentNode.name };
                  }
                  return column;
                }),
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
