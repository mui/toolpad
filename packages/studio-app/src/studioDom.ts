import { DefaultNodeProps, NodeId, StudioNodeProps, StudioStateDefinition } from './types';
import { update } from './utils/immutability';
import { generateUniqueId } from './utils/randomId';

export interface StudioNodeBase {
  readonly id: NodeId;
  readonly type: 'app' | 'theme' | 'api' | 'page' | 'element';
  readonly parentId: NodeId | null;
  readonly name: string;
}

export interface StudioAppNode extends StudioNodeBase {
  readonly type: 'app';
  readonly parentId: null;
  readonly apis: NodeId[];
  readonly pages: NodeId[];
  readonly theme: NodeId;
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
  readonly root: NodeId;
  readonly state: Record<string, StudioStateDefinition>;
}

export interface StudioElementNode<P = DefaultNodeProps> extends StudioNodeBase {
  readonly type: 'element';
  readonly component: string;
  readonly name: string;
  readonly props: Partial<StudioNodeProps<P>>;
  readonly children: NodeId[];
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

export function getPages(dom: StudioDom, root: StudioAppNode): StudioPageNode[] {
  return root.pages.map((nodeId) => {
    const page = getNode(dom, nodeId);
    assertIsPage(page);
    return page;
  });
}

export function getApis(dom: StudioDom, root: StudioAppNode): StudioApiNode[] {
  return root.apis.map((nodeId) => {
    const page = getNode(dom, nodeId);
    assertIsApi(page);
    return page;
  });
}

export function getTheme(dom: StudioDom, root: StudioAppNode): StudioThemeNode {
  const theme = getNode(dom, root.theme);
  assertIsTheme(theme);
  return theme;
}

export function getPageRoot(dom: StudioDom, page: StudioPageNode): StudioElementNode {
  const element = getNode(dom, page.root);
  assertIsElement(element);
  return element;
}

export function getChildren(dom: StudioDom, parent: StudioElementNode): StudioElementNode[] {
  return parent.children.map((nodeId) => {
    const page = getNode(dom, nodeId);
    assertIsElement(page);
    return page;
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
  children: NodeId[] = [],
): StudioElementNode {
  const existingNames = getNodeNames(dom);
  return {
    id: generateUniqueId(new Set(Object.keys(dom.nodes))) as NodeId,
    type: 'element',
    parentId: null,
    component,
    props,
    name: name
      ? generateUniqueName(name, existingNames)
      : generateUniqueName(component, existingNames, true),
    children,
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
