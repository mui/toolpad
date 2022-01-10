import { generateKeyBetween } from 'fractional-indexing';
import { DefaultNodeProps, NodeId, StudioNodeProps, StudioStateDefinition } from './types';
import { omit, update } from './utils/immutability';
import { generateUniqueId } from './utils/randomId';

const ALLOWED_PARENTS = {
  app: [],
  theme: ['app'],
  api: ['app'],
  page: ['app'],
  element: ['page', 'element'],
} as const;

export function createFractionalIndex(index1: string | null, index2: string | null) {
  return generateKeyBetween(index1, index2);
}

// Compares two strings lexicographically
export function compareFractionalIndex(index1: string, index2: string): number {
  if (index1 === index2) {
    return 0;
  }
  return index1 > index2 ? 1 : -1;
}

export interface StudioNodeBase<P = DefaultNodeProps> {
  readonly id: NodeId;
  readonly type: 'app' | 'theme' | 'api' | 'page' | 'element';
  readonly name: string;
  readonly parentId: NodeId | null;
  readonly parentProp: string | null;
  readonly parentIndex: string | null;
  readonly props: Partial<StudioNodeProps<P>>;
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
  readonly connectionId: string;
  readonly query: Q;
}

export interface StudioPageNode extends StudioNodeBase {
  readonly type: 'page';
  readonly title: string;
  readonly state: Record<string, StudioStateDefinition>;
}

export interface StudioElementNode<P = DefaultNodeProps> extends StudioNodeBase<P> {
  readonly type: 'element';
  readonly component: string;
}

type StudioNodeOfType<K extends StudioNodeBase['type']> = {
  app: StudioAppNode;
  api: StudioApiNode;
  theme: StudioThemeNode;
  page: StudioPageNode;
  element: StudioElementNode;
}[K];

export type StudioNodeType = StudioNodeBase['type'];

export type StudioNode = StudioNodeOfType<StudioNodeType>;

type AllowedParents = typeof ALLOWED_PARENTS;
type ParentTypeOfType<T extends StudioNodeType> = AllowedParents[T][number];
export type ParentOf<N extends StudioNode> = StudioNodeOfType<ParentTypeOfType<N['type']>> | null;

type ChildTypeOfType<T extends StudioNodeType> = {
  [K in keyof AllowedParents]: T extends AllowedParents[K][number] ? K : never;
}[keyof AllowedParents];
export type ChildOf<N extends StudioNode> = StudioNodeOfType<ChildTypeOfType<N['type']>>;

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

export interface NodeChildren<N extends StudioNode = any> {
  [prop: string]: ChildOf<N>[] | undefined;
}

// TODO: memoize the result of this function per dom in a WeakMap?
const childrenMemo = new WeakMap<StudioDom, Map<NodeId, NodeChildren<any>>>();
export function getChildNodes<N extends StudioNode>(dom: StudioDom, parent: N): NodeChildren<N> {
  let domChildrenMemo = childrenMemo.get(dom);
  if (!domChildrenMemo) {
    domChildrenMemo = new Map();
    childrenMemo.set(dom, domChildrenMemo);
  }

  let result = domChildrenMemo.get(parent.id);
  if (!result) {
    result = {};
    domChildrenMemo.set(parent.id, result);

    const allNodeChildren: ChildOf<N>[] = Object.values(dom.nodes).filter(
      (node: StudioNode) => node.parentId === parent.id,
    ) as ChildOf<N>[];

    // eslint-disable-next-line no-restricted-syntax
    for (const child of allNodeChildren) {
      const prop = child.parentProp || 'children';
      let existing = result[prop];
      if (!existing) {
        existing = [];
        result[prop] = existing;
      }
      existing.push(child);
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const childArray of Object.values(result)) {
      childArray?.sort((node1: StudioNode, node2: StudioNode) => {
        if (!node1.parentIndex || !node2.parentIndex) {
          throw new Error(
            `Invariant: nodes inside the dom should have a parentIndex if they have a parent`,
          );
        }
        return compareFractionalIndex(node1.parentIndex, node2.parentIndex);
      });
    }
  }

  return result;
}

export function getParent<N extends StudioNode>(dom: StudioDom, child: N): ParentOf<N> {
  if (child.parentId) {
    const parent = getNode(dom, child.parentId);
    return parent as ParentOf<N>;
  }
  return null;
}

export function getPages(dom: StudioDom, app: StudioAppNode): StudioPageNode[] {
  return (getChildNodes(dom, app).children?.filter((node) => isPage(node)) ??
    []) as StudioPageNode[];
}

export function getApis(dom: StudioDom, app: StudioAppNode): StudioApiNode[] {
  return (getChildNodes(dom, app).children?.filter((node) => isApi(node)) ?? []) as StudioApiNode[];
}

// TODO: make theme optional by returning undefined
export function getTheme(dom: StudioDom, app: StudioAppNode): StudioThemeNode | undefined {
  return (getChildNodes(dom, app).children?.find((node) => isTheme(node)) ?? []) as
    | StudioThemeNode
    | undefined;
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

export function createElementInternal<P>(
  dom: StudioDom,
  id: NodeId,
  component: string,
  props: Partial<StudioNodeProps<P>> = {},
  name?: string,
): StudioElementNode {
  const existingNames = getNodeNames(dom);
  return {
    id,
    type: 'element',
    parentId: null,
    parentProp: null,
    parentIndex: null,
    component,
    props,
    name: name
      ? generateUniqueName(name, existingNames)
      : generateUniqueName(component, existingNames, true),
  };
}

type StudioNodeInitOfType<T extends StudioNodeType> = Omit<
  StudioNodeOfType<T>,
  'id' | 'type' | 'parentId' | 'parentProp' | 'parentIndex'
>;

function createNodeInternal<T extends StudioNodeType>(
  id: NodeId,
  type: T,
  name: string,
  init: Omit<StudioNodeInitOfType<T>, 'name'>,
): StudioNodeOfType<T> {
  return {
    id,
    name,
    type,
    parentId: null,
    parentProp: null,
    parentIndex: null,
    ...init,
  } as StudioNodeOfType<T>;
}

export function createNode<T extends StudioNodeType>(
  dom: StudioDom,
  type: T,
  { name, ...init }: StudioNodeInitOfType<T>,
): StudioNodeOfType<T> {
  const id = generateUniqueId(new Set(Object.keys(dom.nodes))) as NodeId;
  const existingNames = getNodeNames(dom);
  return createNodeInternal(id, type, generateUniqueName(name, existingNames), init);
}

export function createDom(): StudioDom {
  const rootId = generateUniqueId(new Set()) as NodeId;
  return {
    nodes: {
      [rootId]: createNodeInternal(rootId, 'app', 'Application', {
        props: {},
      }),
    },
    root: rootId,
  };
}

export function createElement<P>(
  dom: StudioDom,
  component: string,
  props: Partial<StudioNodeProps<P>> = {},
  name?: string,
): StudioElementNode {
  return createNode(dom, 'element', {
    component,
    props,
    name: name || component,
  });
}

export function getDescendants(
  dom: StudioDom,
  node: StudioElementNode | StudioPageNode,
): readonly StudioElementNode[];
export function getDescendants(dom: StudioDom, node: StudioNode): readonly StudioNode[];
export function getDescendants(dom: StudioDom, node: StudioNode): readonly StudioNode[] {
  const children = Object.values(getChildNodes(dom, node)).flat().filter(Boolean);
  return [...children, ...children.flatMap((child) => getDescendants(dom, child))];
}

export function getAncestors(dom: StudioDom, node: StudioNode): readonly StudioNode[] {
  const parent = getParent(dom, node);
  return parent ? [...getAncestors(dom, parent), parent] : [];
}

export function getPageAncestors(
  dom: StudioDom,
  node: StudioElementNode | StudioPageNode,
): readonly (StudioElementNode | StudioPageNode)[] {
  const parent = getParent(dom, node);
  return parent && (isElement(parent) || isPage(parent))
    ? [...getPageAncestors(dom, parent), parent]
    : [];
}

export function getElementPage(dom: StudioDom, node: StudioElementNode): StudioPageNode | null {
  const parent = getParent(dom, node);
  if (parent) {
    return isPage(parent) ? parent : getElementPage(dom, parent);
  }
  return null;
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

export function setNodeProp<P, K extends keyof P>(
  page: StudioDom,
  node: StudioElementNode,
  prop: K,
  value: StudioNodeProps<P>[K],
): StudioDom {
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

function setNodeParent(
  dom: StudioDom,
  node: StudioNode,
  parentId: NodeId,
  parentProp: string,
  parentIndex?: string,
) {
  const parent = getNode(dom, parentId);

  const allowedParents: readonly StudioNodeBase['type'][] = ALLOWED_PARENTS[node.type];
  if (!allowedParents.includes(parent.type)) {
    throw new Error(
      `Node "${node.id}" of type "${node.type}" can't be added to a node of type "${parent.type}"`,
    );
  }

  if (!parentIndex) {
    const siblings = getChildNodes(dom, parent)[parentProp] ?? [];
    const lastIndex = siblings.length > 0 ? siblings[siblings.length - 1].parentIndex : null;
    parentIndex = createFractionalIndex(lastIndex, null);
  }

  return update(dom, {
    nodes: update(dom.nodes, {
      [node.id]: update(node, {
        parentId,
        parentProp,
        parentIndex,
      }),
    }),
  });
}

export function addNode(
  dom: StudioDom,
  newNode: StudioNode,
  parentId: NodeId,
  parentProp: string,
  parentIndex?: string,
) {
  if (newNode.parentId) {
    throw new Error(`Node "${newNode.id}" is already attached to a parent`);
  }

  return setNodeParent(dom, newNode, parentId, parentProp, parentIndex);
}

export function moveNode(
  dom: StudioDom,
  nodeId: NodeId,
  parentId: NodeId,
  parentProp: string,
  parentIndex?: string,
) {
  const node = getNode(dom, nodeId);
  return setNodeParent(dom, node, parentId, parentProp, parentIndex);
}

export function removeNode(dom: StudioDom, nodeId: NodeId) {
  const node = getNode(dom, nodeId);
  const parent = getParent(dom, node);

  if (!parent) {
    throw new Error(`Invariant: Node: "${node.id}" can't be removed`);
  }

  return update(dom, {
    nodes: omit(dom.nodes, node.id),
  });
}
