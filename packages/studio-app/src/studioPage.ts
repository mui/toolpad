// Immutable DOM structures

import { update } from './utils/immutability';
import { generateUniqueId } from './utils/randomId';
import type { NodeId, StudioNode, StudioNodeProp, StudioNodeProps, StudioPage } from './types';

function createNodeInternal<P>(
  id: NodeId,
  component: string,
  props: Partial<StudioNodeProps<P>> = {},
  name: string,
  children: NodeId[],
): StudioNode<P> {
  return {
    id,
    parentId: null,
    name,
    component,
    props,
    children,
  };
}

function generateUniqueName(baseName: string, existingNames: Set<string>, alwaysIndex = false) {
  let i = 1;
  let suggestion = baseName;
  if (alwaysIndex) {
    suggestion += String(i);
    i += 1;
  }
  while (existingNames.has(suggestion)) {
    suggestion = baseName + String(i);
    i += 1;
  }
  return suggestion;
}

function getNodeNames(page: StudioPage): Set<string> {
  return new Set(Object.values(page.nodes).map(({ name }) => name));
}

export function createNode<P>(
  page: StudioPage,
  component: string,
  props: Partial<StudioNodeProps<P>> = {},
  name?: string,
  children: NodeId[] = [],
): StudioNode {
  const existingNames = getNodeNames(page);
  return createNodeInternal(
    generateUniqueId(new Set(Object.keys(page.nodes))) as NodeId,
    component,
    props,
    name
      ? generateUniqueName(name, existingNames)
      : generateUniqueName(component, existingNames, true),
    children,
  );
}

export function createPage(id: string): StudioPage {
  const rootId = generateUniqueId(new Set()) as NodeId;
  const root = createNodeInternal(rootId, 'Page', {}, 'Page', []);
  return {
    id,
    nodes: {
      [rootId]: root,
    },
    state: {},
    root: rootId,
  };
}

export function getNode(page: StudioPage, nodeId: NodeId): StudioNode {
  const node = page.nodes[nodeId];
  if (!node) {
    throw new Error(`Invariant: node "${nodeId}" doesn't exist on the page`);
  }
  return node;
}

export function getDecendants(page: StudioPage, nodeId: NodeId): readonly NodeId[] {
  const node = getNode(page, nodeId);
  return [...node.children, ...node.children.flatMap((child) => getDecendants(page, child))];
}

export function getAncestors(page: StudioPage, nodeId: NodeId): readonly NodeId[] {
  const parentId = getNode(page, nodeId).parentId;
  return parentId ? [...getAncestors(page, parentId), parentId] : [];
}

export function getNodes(page: StudioPage): NodeId[] {
  return Object.keys(page.nodes) as NodeId[];
}

/**
 * Nodes on a page, sorted by depth, root first
 */
export function nodesByDepth(page: StudioPage, nodeId: NodeId = page.root): NodeId[] {
  const node = getNode(page, nodeId);
  return [nodeId, ...node.children.flatMap((child) => nodesByDepth(page, child))];
}

export function setNodeName(page: StudioPage, nodeId: NodeId, name: string): StudioPage {
  const existingNames = getNodeNames(page);
  const node = getNode(page, nodeId);
  return update(page, {
    nodes: update(page.nodes, {
      [node.id]: update(node, {
        name: generateUniqueName(name, existingNames),
      }),
    }),
  });
}

export function setNodeProp<P>(
  page: StudioPage,
  nodeId: NodeId,
  prop: keyof P,
  value: StudioNodeProp<P>,
): StudioPage {
  const node = getNode(page, nodeId);
  return update(page, {
    nodes: update(page.nodes, {
      [node.id]: update(node, {
        props: update(node.props, {
          [prop]: value,
        }),
      }),
    }),
  });
}

export function setNodeProps<P>(
  page: StudioPage,
  nodeId: NodeId,
  props: StudioNodeProps<P>,
): StudioPage {
  const node = getNode(page, nodeId);
  return update(page, {
    nodes: update(page.nodes, {
      [node.id]: update(node, {
        props,
      }),
    }),
  });
}
