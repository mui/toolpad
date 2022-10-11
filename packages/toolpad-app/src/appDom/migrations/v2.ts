import invariant from 'invariant';
import * as appDom from '..';

function replaceMutation(node: appDom.MutationNode): appDom.QueryNode {
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

export default {
  up(dom: appDom.AppDom): appDom.AppDom {
    const { nodes, version = 0 } = dom;
    invariant(version === 1, 'Can only migrate dom of version 1');

    const migratedNodes = Object.fromEntries(
      Object.entries(nodes).map(([id, node]) =>
        appDom.isMutation(node) ? [id, replaceMutation(node)] : [id, node],
      ),
    );

    return { ...dom, nodes: migratedNodes, version: 2 };
  },
};
