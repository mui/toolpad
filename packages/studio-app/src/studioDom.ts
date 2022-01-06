import { DefaultNodeProps, NodeId, StudioNodeProps, StudioStateDefinition } from './types';
import { omit, update } from './utils/immutability';
import { generateUniqueId } from './utils/randomId';

// Naive fractional index implementation
// TODO: improve: https://observablehq.com/@dgreensp/implementing-fractional-indexing
export function createFractionalIndex(index1: number | null, index2: number | null) {
  if (typeof index1 === 'number') {
    console.assert(index1 > 0 && index1 < 1);
  }
  if (typeof index2 === 'number') {
    console.assert(index2 > 0 && index2 < 1);
  }
  if (typeof index1 === 'number' && typeof index2 === 'number') {
    console.assert(index1 < index2);
  }
  return ((index1 || 0) + (index2 || 1)) / 2;
}

export function compareFractionalIndex(index1: number, index2: number): number {
  return index1 - index2;
}

export interface StudioNodeBase {
  readonly id: NodeId;
  readonly type: 'app' | 'theme' | 'api' | 'page' | 'element';
  readonly parentId: NodeId | null;
  readonly parentIndex: number | null;
  readonly name: string;
  // readonly children: NodeId[];
}

export interface StudioAppNode extends StudioNodeBase {
  readonly type: 'app';
  readonly parentId: null;
}

export interface StudioThemeNode extends StudioNodeBase {
  readonly type: 'theme';
  readonly content: string;
}

export interface StudioApiNode<Q = unknown> extends StudioNodeBase {
  readonly type: 'api';
  readonly name: string;
  readonly connectionId: string;
  readonly query: Q;
}

export interface StudioPageNode extends StudioNodeBase {
  readonly type: 'page';
  readonly title: string;
  readonly state: Record<string, StudioStateDefinition>;
}

export interface StudioElementNode<P = DefaultNodeProps> extends StudioNodeBase {
  readonly type: 'element';
  readonly component: string;
  readonly name: string;
  readonly props: Partial<StudioNodeProps<P>>;
}

export type StudioNode =
  | StudioAppNode
  | StudioThemeNode
  | StudioApiNode
  | StudioPageNode
  | StudioElementNode;

export interface StudioNodes {
  [id: NodeId]: StudioNode;
}

export interface StudioDom {
  nodes: StudioNodes;
  root: NodeId;
}

function isType<T extends StudioNode>(node: StudioNode, type: T['type']): node is T {
  return node.type === type;
}

function assertIsType<T extends StudioNode>(node: StudioNode, type: T['type']): asserts node is T {
  if (!isType(node, type)) {
    throw new Error(`Invariant: expected node type "${type}" but got "${node.type}"`);
  }
}
export function getNode(dom: StudioDom, nodeId: NodeId): StudioNode {
  return dom.nodes[nodeId];
}

export function isApp(node: StudioNode): node is StudioAppNode {
  return isType<StudioAppNode>(node, 'app');
}

export function assertIsApp(node: StudioNode): asserts node is StudioAppNode {
  assertIsType<StudioAppNode>(node, 'app');
}

export function isPage(node: StudioNode): node is StudioPageNode {
  return isType<StudioPageNode>(node, 'page');
}

export function assertIsPage(node: StudioNode): asserts node is StudioPageNode {
  assertIsType<StudioPageNode>(node, 'page');
}

export function isApi(node: StudioNode): node is StudioApiNode {
  return isType<StudioApiNode>(node, 'api');
}

export function assertIsApi(node: StudioNode): asserts node is StudioApiNode {
  assertIsType<StudioApiNode>(node, 'api');
}

export function isTheme(node: StudioNode): node is StudioThemeNode {
  return isType<StudioThemeNode>(node, 'theme');
}

export function assertIsTheme(node: StudioNode): asserts node is StudioThemeNode {
  assertIsType<StudioThemeNode>(node, 'theme');
}

export function isElement(node: StudioNode): node is StudioElementNode {
  return isType<StudioElementNode>(node, 'element');
}

export function assertIsElement(node: StudioNode): asserts node is StudioElementNode {
  assertIsType<StudioElementNode>(node, 'element');
}

export function getApp(dom: StudioDom): StudioAppNode {
  const rootNode = getNode(dom, dom.root);
  assertIsApp(rootNode);
  return rootNode;
}

export function getChildren(
  dom: StudioDom,
  parent: StudioAppNode,
): (StudioPageNode | StudioApiNode | StudioThemeNode)[];
export function getChildren(
  dom: StudioDom,
  child: StudioElementNode | StudioPageNode,
): StudioElementNode[];
export function getChildren(dom: StudioDom, parent: StudioNode): StudioNode[];
export function getChildren(dom: StudioDom, parent: StudioNode): StudioNode[] {
  // TODO: memoize this per node in the dom object
  return Object.values(dom.nodes)
    .filter((node: StudioNode) => node.parentId === parent.id)
    .sort((node1: StudioNode, node2: StudioNode) => {
      if (!node1.parentIndex || !node2.parentIndex) {
        throw new Error(
          `Invariant: nodes inside the dom should have a parentIndex if they have a parent`,
        );
      }
      return compareFractionalIndex(node1.parentIndex, node2.parentIndex);
    });
}

export function getParent(dom: StudioDom, child: StudioAppNode): null;
export function getParent(dom: StudioDom, child: StudioApiNode): StudioAppNode | null;
export function getParent(dom: StudioDom, child: StudioPageNode): StudioAppNode | null;
export function getParent(dom: StudioDom, child: StudioThemeNode): StudioAppNode | null;
export function getParent(
  dom: StudioDom,
  child: StudioElementNode,
): StudioPageNode | StudioElementNode | null;
export function getParent(dom: StudioDom, child: StudioNode): StudioNode | null;
export function getParent(dom: StudioDom, child: StudioNode): StudioNode | null {
  if (child.parentId) {
    const parent = getNode(dom, child.parentId);
    return parent;
  }
  return null;
}

export function getPages(dom: StudioDom, app: StudioAppNode): StudioPageNode[] {
  return getChildren(dom, app).filter((node) => isPage(node)) as StudioPageNode[];
}

export function getApis(dom: StudioDom, app: StudioAppNode): StudioApiNode[] {
  return getChildren(dom, app).filter((node) => isApi(node)) as StudioApiNode[];
}

// TODO: make theme optional by returning undefined
export function getTheme(dom: StudioDom, app: StudioAppNode): StudioThemeNode | undefined {
  return getChildren(dom, app).find((node) => isTheme(node)) as StudioThemeNode | undefined;
}

export function getPageRoot(dom: StudioDom, page: StudioPageNode): StudioElementNode {
  const [root] = getChildren(dom, page);
  return root;
}

export function setNodeName(dom: StudioDom, node: StudioNode, name: string): StudioDom {
  return update(dom, {
    nodes: update(dom.nodes, {
      [node.id]: {
        ...node,
        name,
      },
    }),
  });
}

export function setNodeProps<P>(
  page: StudioDom,
  node: StudioElementNode,
  props: StudioNodeProps<P>,
): StudioDom {
  return update(page, {
    nodes: update(page.nodes, {
      [node.id]: update(node, {
        props,
      }),
    }),
  });
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

function getNodeNames(dom: StudioDom): Set<string> {
  return new Set(Object.values(dom.nodes).map(({ name }) => name));
}

export function createElement<P>(
  dom: StudioDom,
  component: string,
  props: Partial<StudioNodeProps<P>> = {},
  name?: string,
): StudioElementNode {
  const existingNames = getNodeNames(dom);
  return {
    id: generateUniqueId(new Set(Object.keys(dom.nodes))) as NodeId,
    type: 'element',
    parentId: null,
    parentIndex: null,
    component,
    props,
    name: name
      ? generateUniqueName(name, existingNames)
      : generateUniqueName(component, existingNames, true),
  };
}

/**
 * Nodes on a page, sorted by depth, root first
 */
export function elementsByDepth(
  dom: StudioDom,
  node: StudioElementNode | StudioPageNode,
): readonly StudioElementNode[] {
  if (isPage(node)) {
    const root = getPageRoot(dom, node);
    return elementsByDepth(dom, root);
  }
  return [node, ...getChildren(dom, node).flatMap((child) => elementsByDepth(dom, child))];
}

export function getDecendants(
  dom: StudioDom,
  node: StudioElementNode,
): readonly StudioElementNode[] {
  const children = getChildren(dom, node);
  return [...children, ...children.flatMap((child) => getDecendants(dom, child))];
}

export function getAncestors(
  dom: StudioDom,
  node: StudioElementNode,
): readonly (StudioElementNode | StudioPageNode)[] {
  const parent = getParent(dom, node);
  return parent && isElement(parent) ? [...getAncestors(dom, parent), parent] : [];
}

export function getElementPage(dom: StudioDom, node: StudioElementNode): StudioPageNode | null {
  const parent = getParent(dom, node);
  if (parent) {
    return isPage(parent) ? parent : getElementPage(dom, parent);
  }
  return null;
}

export function addChild(
  dom: StudioDom,
  newNode: StudioNode,
  parentId: NodeId,
  parentIndex?: number,
) {
  if (!parentIndex) {
    const parent = getNode(dom, parentId);
    const siblings = getChildren(dom, parent);
    const lastIndex = siblings.length > 0 ? siblings[siblings.length - 1].parentIndex : null;
    parentIndex = createFractionalIndex(lastIndex, null);
  }
  return update(dom, {
    nodes: update(dom.nodes, {
      [newNode.id]: update(newNode, {
        parentId,
        parentIndex,
      }),
    }),
  });
}

export function removeNode(dom: StudioDom, nodeId: NodeId) {
  const node = getNode(dom, nodeId);
  const parent = getParent(dom, node);

  if (!parent) {
    throw new Error(`Invariant: Node: "${node.id}" can not be removed`);
  }

  return update(dom, {
    nodes: omit(dom.nodes, node.id),
  });
}
