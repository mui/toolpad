import { ArgTypeDefinitions, PropValueType, PropValueTypes } from '@mui/studio-core';
import { generateKeyBetween } from 'fractional-indexing';
import {
  NodeId,
  StudioConstant,
  StudioBindable,
  StudioBindables,
  ConnectionStatus,
  StudioTheme,
} from './types';
import { omit, update } from './utils/immutability';
import { generateUniqueId } from './utils/randomId';
import { generateUniqueString } from './utils/strings';
import { ExactEntriesOf } from './utils/types';

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

type StudioNodeType =
  | 'app'
  | 'connection'
  | 'api'
  | 'theme'
  | 'page'
  | 'element'
  | 'codeComponent'
  | 'derivedState'
  | 'queryState'
  | 'fetchedState';

export interface StudioNodeBase {
  readonly id: NodeId;
  readonly type: StudioNodeType;
  readonly name: string;
  readonly parentId: NodeId | null;
  readonly parentProp: string | null;
  readonly parentIndex: string | null;
}

export interface StudioAppNode extends StudioNodeBase {
  readonly type: 'app';
  readonly parentId: null;
}

export interface StudioThemeNode extends StudioNodeBase {
  readonly type: 'theme';
  readonly theme: StudioBindables<StudioTheme>;
}

export interface StudiConnectionNode<P = unknown> extends StudioNodeBase {
  readonly type: 'connection';
  readonly dataSource: string;
  readonly params: P;
  readonly status: ConnectionStatus | null;
}

export interface StudioApiNode<Q = unknown> extends StudioNodeBase {
  readonly type: 'api';
  readonly connectionId: string;
  readonly connectionType: string;
  readonly query: Q;
}

export interface StudioPageNode extends StudioNodeBase {
  readonly type: 'page';
  readonly title: string;
  readonly urlQuery: Record<string, string>;
}

export interface StudioElementNode<P = any> extends StudioNodeBase {
  readonly type: 'element';
  readonly component: string;
  readonly props: StudioBindables<P>;
}

export interface StudioCodeComponentNode extends StudioNodeBase {
  readonly type: 'codeComponent';
  readonly code: string;
  readonly argTypes: ArgTypeDefinitions;
}

export interface StudioDerivedStateNode<P = any> extends StudioNodeBase {
  readonly type: 'derivedState';
  readonly code: string;
  readonly params: StudioBindables<P>;
  readonly argTypes: PropValueTypes<keyof P & string>;
  readonly returnType: PropValueType;
}

export interface StudioQueryStateNode<P = any> extends StudioNodeBase {
  readonly type: 'queryState';
  readonly api: NodeId | null;
  readonly params: StudioBindables<P>;
}

export interface StudioFetchedStateNode extends StudioNodeBase {
  readonly type: 'fetchedState';
  readonly url: StudioBindable<string>;
  readonly collectionPath: string;
  readonly fieldPaths: Record<string, string>;
}

type StudioNodeOfType<K extends StudioNodeType> = {
  app: StudioAppNode;
  connection: StudiConnectionNode;
  api: StudioApiNode;
  theme: StudioThemeNode;
  page: StudioPageNode;
  element: StudioElementNode;
  codeComponent: StudioCodeComponentNode;
  derivedState: StudioDerivedStateNode;
  queryState: StudioQueryStateNode;
  fetchedState: StudioFetchedStateNode;
}[K];

type AllowedChildren = {
  app: {
    pages: 'page';
    connections: 'connection';
    apis: 'api';
    themes: 'theme';
    codeComponents: 'codeComponent';
  };
  theme: {};
  api: {};
  connection: {};
  page: {
    children: 'element';
    derivedStates: 'derivedState';
    queryStates: 'queryState';
    fetchedStates: 'fetchedState';
  };
  element: {
    [prop: string]: 'element';
  };
  codeComponent: {};
  derivedState: {};
  queryState: {};
  fetchedState: {};
};

export type StudioNode = StudioNodeOfType<StudioNodeType>;

type TypeOf<N extends StudioNode> = N['type'];
type AllowedChildTypesOfType<T extends StudioNodeType> = AllowedChildren[T];
type AllowedChildTypesOf<N extends StudioNode> = AllowedChildTypesOfType<TypeOf<N>>;

export type ChildNodesOf<N extends StudioNode> = {
  [K in keyof AllowedChildTypesOf<N>]: AllowedChildTypesOf<N>[K] extends StudioNodeType
    ? StudioNodeOfType<AllowedChildTypesOf<N>[K]>[]
    : never;
};

type CombinedChildrenOfType<T extends StudioNodeType> =
  AllowedChildren[T][keyof AllowedChildren[T]];

type CombinedAllowedChildren = {
  [K in StudioNodeType]: CombinedChildrenOfType<K>;
};

type ParentTypeOfType<T extends StudioNodeType> = {
  [K in StudioNodeType]: T extends CombinedAllowedChildren[K] ? K : never;
}[StudioNodeType];
export type ParentOf<N extends StudioNode> = StudioNodeOfType<ParentTypeOfType<TypeOf<N>>> | null;

export type ParentPropOf<Child extends StudioNode, Parent extends StudioNode> = {
  [K in keyof AllowedChildren[TypeOf<Parent>]]: TypeOf<Child> extends AllowedChildren[TypeOf<Parent>][K]
    ? K & string
    : never;
}[keyof AllowedChildren[TypeOf<Parent>]];

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

export function getMaybeNode<T extends StudioNodeType>(
  dom: StudioDom,
  nodeId: NodeId,
  type: T,
): StudioNodeOfType<T> | null;
export function getMaybeNode<T extends StudioNodeType>(
  dom: StudioDom,
  nodeId: NodeId,
  type?: T,
): StudioNode | null;
export function getMaybeNode<T extends StudioNodeType>(
  dom: StudioDom,
  nodeId: NodeId,
  type?: T,
): StudioNode | null {
  const node = dom.nodes[nodeId];
  if (!node) {
    return null;
  }
  if (type) {
    assertIsType(node, type);
  }
  return node;
}

export function getNode<T extends StudioNodeType>(
  dom: StudioDom,
  nodeId: NodeId,
  type: T,
): StudioNodeOfType<T>;
export function getNode<T extends StudioNodeType>(
  dom: StudioDom,
  nodeId: NodeId,
  type?: T,
): StudioNode;
export function getNode<T extends StudioNodeType>(
  dom: StudioDom,
  nodeId: NodeId,
  type?: T,
): StudioNode {
  const node = getMaybeNode(dom, nodeId, type);
  if (!node) {
    throw new Error(`Node "${nodeId}" not found`);
  }
  return node;
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

export function isApi<P>(node: StudioNode): node is StudioApiNode<P> {
  return isType<StudioApiNode>(node, 'api');
}

export function assertIsApi<P>(node: StudioNode): asserts node is StudioApiNode<P> {
  assertIsType<StudioApiNode>(node, 'api');
}

export function isCodeComponent(node: StudioNode): node is StudioCodeComponentNode {
  return isType<StudioCodeComponentNode>(node, 'codeComponent');
}

export function assertIsCodeComponent(node: StudioNode): asserts node is StudioCodeComponentNode {
  assertIsType<StudioCodeComponentNode>(node, 'codeComponent');
}

export function isTheme(node: StudioNode): node is StudioThemeNode {
  return isType<StudioThemeNode>(node, 'theme');
}

export function assertIsTheme(node: StudioNode): asserts node is StudioThemeNode {
  assertIsType<StudioThemeNode>(node, 'theme');
}

export function isElement<P>(node: StudioNode): node is StudioElementNode<P> {
  return isType<StudioElementNode>(node, 'element');
}

export function assertIsElement<P>(node: StudioNode): asserts node is StudioElementNode<P> {
  assertIsType<StudioElementNode>(node, 'element');
}

export function isDerivedState<P>(node: StudioNode): node is StudioDerivedStateNode<P> {
  return isType<StudioDerivedStateNode>(node, 'derivedState');
}

export function assertIsDerivedState<P>(
  node: StudioNode,
): asserts node is StudioDerivedStateNode<P> {
  assertIsType<StudioDerivedStateNode>(node, 'derivedState');
}

export function isQueryState<P>(node: StudioNode): node is StudioQueryStateNode<P> {
  return isType<StudioQueryStateNode>(node, 'queryState');
}

export function assertIsQueryState<P>(node: StudioNode): asserts node is StudioQueryStateNode<P> {
  assertIsType<StudioQueryStateNode>(node, 'queryState');
}

export function isFetchedState(node: StudioNode): node is StudioFetchedStateNode {
  return isType<StudioFetchedStateNode>(node, 'fetchedState');
}

export function assertIsFetchedState(node: StudioNode): asserts node is StudioFetchedStateNode {
  assertIsType<StudioFetchedStateNode>(node, 'fetchedState');
}

export function getApp(dom: StudioDom): StudioAppNode {
  const rootNode = getNode(dom, dom.root);
  assertIsApp(rootNode);
  return rootNode;
}

export type NodeChildren<N extends StudioNode = any> = ChildNodesOf<N>;

// TODO: memoize the result of this function per dom in a WeakMap
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

    const allNodeChildren: StudioNode[] = Object.values(dom.nodes).filter(
      (node: StudioNode) => node.parentId === parent.id,
    );

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

function getNodeNames(dom: StudioDom): Set<string> {
  return new Set(Object.values(dom.nodes).map(({ name }) => name));
}

export function createElementInternal<P>(
  dom: StudioDom,
  id: NodeId,
  component: string,
  props: Partial<StudioBindables<P>> = {},
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
      ? generateUniqueString(name, existingNames)
      : generateUniqueString(component, existingNames, true),
  };
}

type StudioNodeInitOfType<T extends StudioNodeType> = Omit<
  StudioNodeOfType<T>,
  'id' | 'type' | 'parentId' | 'parentProp' | 'parentIndex' | 'name'
> & { name?: string };

function createNodeInternal<T extends StudioNodeType>(
  id: NodeId,
  type: T,
  init: StudioNodeInitOfType<T> & { name: string },
): StudioNodeOfType<T> {
  return {
    ...init,
    id,
    type,
    parentId: null,
    parentProp: null,
    parentIndex: null,
  } as StudioNodeOfType<T>;
}

export function createNode<T extends StudioNodeType>(
  dom: StudioDom,
  type: T,
  init: StudioNodeInitOfType<T>,
): StudioNodeOfType<T> {
  const id = generateUniqueId(new Set(Object.keys(dom.nodes))) as NodeId;
  const existingNames = getNodeNames(dom);
  return createNodeInternal(id, type, {
    ...init,
    name: generateUniqueString(init.name || type, existingNames),
  });
}

export function createDom(): StudioDom {
  const rootId = generateUniqueId(new Set()) as NodeId;
  return {
    nodes: {
      [rootId]: createNodeInternal(rootId, 'app', {
        name: 'Application',
      }),
    },
    root: rootId,
  };
}

/**
 * Creates a new DOM node representing aReact Element
 */
export function createElement<P>(
  dom: StudioDom,
  component: string,
  props: Partial<StudioBindables<P>> = {},
  name?: string,
): StudioElementNode {
  return createNode(dom, 'element', {
    component,
    name: name || component,
    props,
  });
}

/**
 * Get all descendants of a `node`, flattens childNodes objects into one single array
 */
export function getDescendants(dom: StudioDom, node: StudioNode): readonly StudioNode[] {
  const children: readonly StudioNode[] = Object.values(getChildNodes(dom, node))
    .flat()
    .filter(Boolean);
  return [...children, ...children.flatMap((child) => getDescendants(dom, child))];
}

export function getAncestors(dom: StudioDom, node: StudioNode): readonly StudioNode[] {
  const parent = getParent(dom, node);
  return parent ? [...getAncestors(dom, parent), parent] : [];
}

/**
 * Get all the ancestors of the `node` up until the first StudioPageNode node is encountered
 */
export function getPageAncestors(
  dom: StudioDom,
  node: StudioNode,
): readonly (StudioElementNode | StudioPageNode)[] {
  const parent = getParent(dom, node);
  return parent && (isElement(parent) || isPage(parent))
    ? [...getPageAncestors(dom, parent), parent]
    : [];
}

/**
 * Get the first StudioPageNode node up in the DOM tree starting from `node`
 */
export function getPageAncestor(dom: StudioDom, node: StudioNode): StudioPageNode | null {
  if (isPage(node)) {
    return node;
  }
  const parent = getParent(dom, node);
  if (parent) {
    return getPageAncestor(dom, parent);
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

export type PropNamespaces<N extends StudioNode> = {
  [K in keyof N]: N[K] extends StudioBindables<any> ? K : never;
}[keyof N & string];

export type BindableProps<T> = {
  [K in keyof T]: T[K] extends StudioBindable<any> ? K : never;
}[keyof T & string];

export function setNodeProp<Node extends StudioNode, Prop extends BindableProps<Node>>(
  dom: StudioDom,
  node: Node,
  prop: Prop,
  value: Node[Prop] | null,
): StudioDom {
  if (value) {
    return update(dom, {
      nodes: update(dom.nodes, {
        [node.id]: update(node, {
          [prop]: value,
        } as any) as Partial<Node>,
      } as Partial<StudioNodes>),
    });
  }

  return update(dom, {
    nodes: update(dom.nodes, {
      [node.id]: omit(node, prop) as Partial<Node>,
    } as Partial<StudioNodes>),
  });
}

export function setNodeNamespacedProp<
  Node extends StudioNode,
  Namespace extends PropNamespaces<Node>,
  Prop extends keyof Node[Namespace] & string,
>(
  dom: StudioDom,
  node: Node,
  namespace: Namespace,
  prop: Prop,
  value: Node[Namespace][Prop] | null,
): StudioDom {
  if (value) {
    return update(dom, {
      nodes: update(dom.nodes, {
        [node.id]: update(node, {
          [namespace]: update(node[namespace], {
            [prop]: value,
          } as any) as Partial<Node[Namespace]>,
        } as Partial<Node>),
      }),
    });
  }
  return update(dom, {
    nodes: update(dom.nodes, {
      [node.id]: update(node, {
        [namespace]: omit(node[namespace], prop) as Partial<Node[Namespace]>,
      } as Partial<Node>),
    }),
  });
}

function setNodeParent<N extends StudioNode>(
  dom: StudioDom,
  node: N,
  parentId: NodeId,
  parentProp: string,
  parentIndex?: string,
) {
  const parent = getNode(dom, parentId);

  if (!parentIndex) {
    const siblings: readonly StudioNode[] = (getChildNodes(dom, parent) as any)[parentProp] ?? [];
    const lastIndex = siblings.length > 0 ? siblings[siblings.length - 1].parentIndex : null;
    parentIndex = createFractionalIndex(lastIndex, null);
  }

  return update(dom, {
    nodes: update(dom.nodes, {
      [node.id]: update(node as StudioNode, {
        parentId,
        parentProp,
        parentIndex,
      }),
    }),
  });
}

export function addNode<Parent extends StudioNode, Child extends StudioNode>(
  dom: StudioDom,
  newNode: Child,
  parent: Parent,
  parentProp: ParentPropOf<Child, Parent>,
  parentIndex?: string,
): StudioDom {
  if (newNode.parentId) {
    throw new Error(`Node "${newNode.id}" is already attached to a parent`);
  }

  return setNodeParent(dom, newNode, parent.id, parentProp, parentIndex);
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

export function saveNode(dom: StudioDom, node: StudioNode) {
  return update(dom, {
    nodes: update(dom.nodes, {
      [node.id]: update(
        dom.nodes[node.id],
        omit(node, 'id', 'type', 'name', 'parentId', 'parentProp', 'parentIndex'),
      ),
    }),
  });
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

export function toConstPropValue<T = any>(value: T): StudioConstant<T> {
  return { type: 'const', value };
}

export function fromConstPropValue(prop: undefined): undefined;
export function fromConstPropValue<T>(prop: StudioBindable<T>): T;
export function fromConstPropValue<T>(prop?: StudioBindable<T | undefined>): T | undefined;
export function fromConstPropValue<T>(prop?: StudioBindable<T | undefined>): T | undefined {
  if (!prop) {
    return undefined;
  }
  if (prop.type !== 'const') {
    throw new Error(`trying to unbox a non-constant prop value`);
  }
  return prop.value;
}

export function toConstPropValues<P = any>(props: Partial<P>): Partial<StudioBindables<P>>;
export function toConstPropValues<P = any>(props: P): StudioBindables<P>;
export function toConstPropValues<P = any>(props: P): StudioBindables<P> {
  return Object.fromEntries(
    Object.entries(props).flatMap(([propName, value]) =>
      value ? [[propName, toConstPropValue(value)]] : [],
    ),
  ) as StudioBindables<P>;
}

export function fromConstPropValues<P>(props: StudioBindables<P>): Partial<P> {
  const result: Partial<P> = {};
  (Object.entries(props) as ExactEntriesOf<StudioBindables<P>>).forEach(([name, prop]) => {
    if (prop) {
      result[name] = fromConstPropValue<P[typeof name]>(prop);
    }
  });
  return result;
}

export type Attributes<N extends StudioNode> = Exclude<keyof N & string, keyof StudioNodeBase>;

export function setNodeAttribute<N extends StudioNode, K extends Attributes<N>>(
  dom: StudioDom,
  node: N,
  attribute: K,
  value: N[K],
): StudioDom {
  const updates: Partial<N> = {};
  updates[attribute] = value;
  return update(dom, {
    nodes: update(dom.nodes, {
      [node.id]: update(node, updates),
    }),
  });
}

const nodeByNameCache = new WeakMap<StudioDom, Map<string, NodeId>>();
function getNodeIdByNameIndex(dom: StudioDom): Map<string, NodeId> {
  let cached = nodeByNameCache.get(dom);
  if (!cached) {
    cached = new Map(Array.from(Object.values(dom.nodes), (node) => [node.name, node.id]));
    nodeByNameCache.set(dom, cached);
  }
  return cached;
}

export function getNodeIdByName(dom: StudioDom, name: string): NodeId | null {
  const index = getNodeIdByNameIndex(dom);
  return index.get(name) ?? null;
}
