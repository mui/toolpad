import invariant from 'invariant';
import { AppDom, QueryNode, createConst, isQuery, ElementNode, isElement, ref } from '../appDom';
import { update } from '../utils/immutability';

function migrateLegacyQueryNode(node: QueryNode<any>): QueryNode<any> {
  if (node.attributes.dataSource?.value !== 'rest') {
    return node;
  }

  // Migrate old rest nodes with transforms
  if (
    typeof node.attributes.query.value?.transformEnabled !== 'undefined' &&
    (node.attributes.transformEnabled || node.attributes.transform)
  ) {
    return update(node, {
      attributes: update(node.attributes, {
        transformEnabled: undefined,
        transform: undefined,
      }),
    });
  }

  if (node.attributes.transformEnabled || node.attributes.transform) {
    return update(node, {
      attributes: update(node.attributes, {
        transformEnabled: undefined,
        transform: undefined,
        query: createConst({
          ...node.attributes.query.value,
          transformEnabled: node.attributes.transformEnabled?.value,
          transform: node.attributes.transform?.value,
        }),
      }),
    });
  }

  // Update all query connectionId
  if (node.attributes.query.value?.connectionId) {
    if (typeof node.attributes.query.value?.connectionId?.value === 'string') {
      return update(node, {
        attributes: update(node.attributes, {
          query: createConst({
            ...node.attributes.query.value,
            connectionId: createConst(ref(node.attributes.query.value.connectionId.value)),
          }),
        }),
      });
    }
  }
  return node;
}

function migrateLegacyNavigationAction(node: ElementNode<any>): ElementNode<any> {
  if (node.props?.onClick?.type === 'navigationAction') {
    if (typeof node.props.onClick.value?.page === 'string') {
      return update(node, {
        props: update(node.props, {
          onClick: update(node.props.onClick, {
            value: update(node.props.onClick.value, {
              page: ref(node.props.onClick.value.page),
            }),
          }),
        }),
      });
    }
  }
  return node;
}

export default {
  up(dom: AppDom): AppDom {
    const { nodes, version = 0 } = dom;
    invariant(version === 0, 'Can only migrate dom of version 0');
    const migratedNodes = Object.fromEntries(
      Object.entries(nodes).map(([id, node]) => {
        if (isQuery(node)) {
          return [id, migrateLegacyQueryNode(node)];
        }
        if (isElement(node)) {
          return [id, migrateLegacyNavigationAction(node)];
        }
        return [id, node];
      }),
    );
    return { ...dom, nodes: migratedNodes, version: 1 };
  },
};
