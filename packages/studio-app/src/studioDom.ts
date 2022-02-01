import { ArgTypeDefinitions, PropValueType, PropValueTypes } from '@mui/studio-core';
import { generateKeyBetween } from 'fractional-indexing';
import { NodeId, StudioNodeProps } from './types';
import { omit, update } from './utils/immutability';
import { generateUniqueId } from './utils/randomId';
import { ExactEntriesOf } from './utils/types';

const ALLOWED_CHILDREN = {
  app: {
    pages: ['page'],
    apis: ['api'],
    themes: ['theme'],
    codeComponents: ['codeComponent'],
  },
  theme: {},
  api: {},
  page: {
    children: ['element'],
    derivedStates: ['derivedState'],
    queryStates: ['queryState'],
  },
  element: {
    children: ['element'],
  },
  codeComponent: {},
  derivedState: {},
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

type StudioNodeType =
  | 'app'
  | 'theme'
  | 'api'
  | 'page'
  | 'element'
  | 'codeComponent'
  | 'derivedState'
  | 'queryState';

export interface StudioNodeBase<P = any> {
  readonly id: NodeId;
  readonly type: StudioNodeType;
  readonly name: string;
  readonly parentId: NodeId | null;
  readonly parentProp: string | null;
  readonly parentIndex: string | null;
  readonly props: StudioNodeProps<P>;
}

export interface StudioAppNode extends StudioNodeBase {
  readonly type: 'app';
  readonly parentId: null;
}

export interface StudioTheme {
  'palette.primary.main'?: string;
  'palette.secondary.main'?: string;
}

export interface StudioThemeNode extends StudioNodeBase<StudioTheme> {
  readonly type: 'theme';
}

export interface StudioApiNode<P = {}> extends StudioNodeBase<P> {
  readonly type: 'api';
  readonly connectionId: string;
  readonly argTypes: ArgTypeDefinitions;
}

export interface StudioPageNode extends StudioNodeBase {
  readonly type: 'page';
  readonly title: string;
}

export interface StudioElementNode<P = {}> extends StudioNodeBase<P> {
  readonly type: 'element';
  readonly component: string;
}

export interface StudioCodeComponentNode<P = {}> extends StudioNodeBase<P> {
  readonly type: 'codeComponent';
  readonly code: string;
  readonly argTypes: ArgTypeDefinitions;
}

export interface StudioDerivedStateNode<P = {}> extends StudioNodeBase<P> {
  readonly type: 'derivedState';
  readonly code: string;
  readonly props: StudioNodeProps<P>;
  readonly argTypes: PropValueTypes;
  readonly returnType: PropValueType;
}

export interface StudioQueryStateNode<P = {}> extends StudioNodeBase<P> {
  readonly type: 'queryState';
  readonly api: NodeId | null;
  readonly props: StudioNodeProps<P>;
}

type StudioNodeOfType<K extends StudioNodeBase['type']> = {
  app: StudioAppNode;
  api: StudioApiNode;
  theme: StudioThemeNode;
  page: StudioPageNode;
  element: StudioElementNode;
  codeComponent: StudioCodeComponentNode;
  derivedState: StudioDerivedStateNode;
  queryState: StudioQueryStateNode;
}[K];

export type StudioNode =
  | StudioAppNode
  | StudioApiNode
  | StudioThemeNode
  | StudioPageNode
  | StudioElementNode
  | StudioCodeComponentNode
  | StudioDerivedStateNode
  | StudioQueryStateNode;

type AllowedChildren = typeof ALLOWED_CHILDREN;
type TypeOf<N extends StudioNode> = N['type'];
type AllowedChildTypesOfType<T extends StudioNodeType> = T extends keyof AllowedChildren
  ? AllowedChildren[T]
  : {};
type AllowedChildTypesOf<N extends StudioNode> = AllowedChildTypesOfType<TypeOf<N>>;

export type ChildNodesOf<N extends StudioNode> = {
  [K in keyof AllowedChildTypesOf<N>]: AllowedChildTypesOf<N>[K] extends readonly StudioNodeType[]
    ? StudioNodeOfType<AllowedChildTypesOf<N>[K][number]>[] | undefined
    : never;
};

type CombinedChildrenOf<T extends { readonly [K in string]: readonly StudioNodeType[] }> = {
  [K in keyof T]: T[K][number];
}[keyof T];

type CombinedChildrenOfType<T extends StudioNodeType> = T extends keyof AllowedChildren
  ? CombinedChildrenOf<AllowedChildren[T]>
  : never;

type CombinedAllowedChildren = {
  [K in StudioNodeType]: CombinedChildrenOfType<K>;
};

type ParentTypeOfType<T extends StudioNodeType> = {
  [K in StudioNodeType]: T extends CombinedAllowedChildren[K] ? K : never;
}[StudioNodeType];
export type ParentOf<N extends StudioNode> = StudioNodeOfType<ParentTypeOfType<TypeOf<N>>> | null;

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

export function isApi<P>(node: StudioNode): node is StudioApiNode<P> {
  return isType<StudioApiNode>(node, 'api');
}

export function assertIsApi<P>(node: StudioNode): asserts node is StudioApiNode<P> {
  assertIsType<StudioApiNode>(node, 'api');
}

export function isCodeComponent<P>(node: StudioNode): node is StudioCodeComponentNode<P> {
  return isType<StudioCodeComponentNode>(node, 'codeComponent');
}

export function assertIsCodeComponent<P>(
  node: StudioNode,
): asserts node is StudioCodeComponentNode<P> {
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
  'id' | 'type' | 'parentId' | 'parentProp' | 'parentIndex' | 'name' | 'props'
> & { name?: string; props?: StudioNodeOfType<T>['props'] };

function createNodeInternal<T extends StudioNodeType>(
  id: NodeId,
  type: T,
  init: StudioNodeInitOfType<T> & { name: string },
): StudioNodeOfType<T> {
  return {
    props: {},
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
    name: generateUniqueName(init.name || type, existingNames),
  });
}

export function createDom(): StudioDom {
  const rootId = generateUniqueId(new Set()) as NodeId;
  return {
    nodes: {
      [rootId]: createNodeInternal(rootId, 'app', {
        name: 'Application',
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

export function getPageAncestors(
  dom: StudioDom,
  node: StudioNode,
): readonly (StudioElementNode | StudioPageNode)[] {
  const parent = getParent(dom, node);
  return parent && (isElement(parent) || isPage(parent))
    ? [...getPageAncestors(dom, parent), parent]
    : [];
}

export function getPageAncestor(
  dom: StudioDom,
  node: StudioElementNode | StudioDerivedStateNode,
): StudioPageNode | null {
  const parent = getParent(dom, node);
  if (parent) {
    return isPage(parent) ? parent : getPageAncestor(dom, parent);
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
  node: StudioNodeBase<P>,
  props: StudioNodeProps<P>,
): StudioDom {
  return update(page, {
    nodes: update(page.nodes, {
      [node.id]: update(node, {
        props,
      }) as StudioNode,
    }),
  });
}

export function setNodeProp<P, K extends keyof P & string>(
  page: StudioDom,
  node: StudioNode,
  prop: K,
  value: StudioNodeProps<P>[K] | null,
): StudioDom {
  if (value) {
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
  return update(page, {
    nodes: update(page.nodes, {
      [node.id]: update(node, {
        props: omit(node.props as any, prop),
      }),
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

  const allowedChildren: readonly StudioNodeType[] = (ALLOWED_CHILDREN as any)[
    parent.type as StudioNodeType
  ]?.[parentProp];
  if (!allowedChildren.includes(node.type)) {
    throw new Error(
      `Node "${node.id}" of type "${node.type}" can't be added to a node of type "${parent.type}"`,
    );
  }

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

export function saveNode(dom: StudioDom, node: StudioNode) {
  const nodeId = node.id;
  const updates = omit(node, 'id', 'type', 'name', 'parentId', 'parentProp', 'parentIndex');
  return update(dom, {
    nodes: update(dom.nodes, {
      [nodeId]: update(node, updates),
    }),
  });
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

export function getConstPropValue<P, K extends keyof P>(
  node: StudioNodeBase<P>,
  propName: keyof P,
): P[K] | undefined {
  const prop = node.props[propName];
  return prop?.type === 'const' ? (prop.value as P[K]) : undefined;
}

export function getPropConstValues<P>(node: StudioNodeBase<P>): Partial<P> {
  const result: Partial<P> = {};
  (Object.keys(node.props) as (keyof P)[]).forEach((prop) => {
    result[prop] = getConstPropValue(node, prop as keyof P);
  });
  return result;
}

export function setPropConstValues<P>(node: StudioApiNode<P>, values: Partial<P>): StudioApiNode<P>;
export function setPropConstValues<P>(
  node: StudioElementNode<P>,
  values: Partial<P>,
): StudioElementNode<P>;
export function setPropConstValues<P>(node: StudioThemeNode, values: Partial<P>): StudioThemeNode;
export function setPropConstValues<P>(node: StudioNode, values: Partial<P>): StudioNode;
export function setPropConstValues<P>(node: StudioNode, values: Partial<P>): StudioNode {
  const propUpdates: Partial<StudioNodeProps<P>> = {};
  (Object.entries(values) as ExactEntriesOf<P>).forEach(([prop, value]) => {
    propUpdates[prop] = {
      type: 'const',
      value,
    };
  });
  return update(node, {
    props: update(node.props, propUpdates),
  });
}

export function setNodePropConstValue<P, K extends keyof P>(
  node: StudioNodeBase<P>,
  key: K,
  value: P[K],
): StudioNodeBase<P> {
  const propUpdates: Partial<StudioNodeProps<P>> = {};
  propUpdates[key] = {
    type: 'const',
    value,
  };
  return update(node, {
    props: update(node.props, propUpdates),
  });
}

export function setNodePropConstValues<P>(
  dom: StudioDom,
  node: StudioApiNode<P>,
  values: Partial<P>,
): StudioDom;
export function setNodePropConstValues<P>(
  dom: StudioDom,
  node: StudioElementNode<P>,
  values: Partial<P>,
): StudioDom;
export function setNodePropConstValues<P>(
  dom: StudioDom,
  node: StudioThemeNode,
  values: Partial<P>,
): StudioDom;
export function setNodePropConstValues<P>(
  dom: StudioDom,
  node: StudioNode,
  values: Partial<P>,
): StudioDom;
export function setNodePropConstValues<P>(
  dom: StudioDom,
  node: StudioNode,
  values: Partial<P>,
): StudioDom {
  const propUpdates: Partial<StudioNodeProps<P>> = {};
  (Object.entries(values) as ExactEntriesOf<P>).forEach(([prop, value]) => {
    propUpdates[prop] = {
      type: 'const',
      value,
    };
  });
  return update(dom, {
    nodes: update(dom.nodes, {
      [node.id]: setPropConstValues(node, values),
    }),
  });
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
