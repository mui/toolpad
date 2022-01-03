import { DefaultNodeProps, NodeId, StudioNodeProps, StudioStateDefinition } from './types';

export interface StudioNodeBase {
  readonly id: NodeId;
  readonly type: 'app' | 'theme' | 'api' | 'page' | 'element';
  readonly parentId: NodeId | null;
}

export interface StudioAppNode extends StudioNodeBase {
  readonly id: NodeId;
  readonly type: 'app';
  readonly parentId: null;
  readonly apis: NodeId[];
  readonly pages: NodeId[];
  readonly theme: NodeId;
}

export interface StudioThemeNode extends StudioNodeBase {
  readonly id: NodeId;
  readonly type: 'theme';
  readonly parentId: NodeId;
  readonly content: string;
}

export interface StudioApiNode<Q = unknown> extends StudioNodeBase {
  readonly id: NodeId;
  readonly type: 'api';
  readonly parentId: NodeId;
  readonly name: string;
  readonly connectionId: string;
  readonly query: Q;
}

export interface StudioPageNode extends StudioNodeBase {
  readonly id: NodeId;
  readonly type: 'page';
  readonly parentId: NodeId;
  readonly title: string;
  readonly children: NodeId[];
  readonly state: Record<string, StudioStateDefinition>;
}

export interface StudioElementNode<P = DefaultNodeProps> extends StudioNodeBase {
  readonly id: NodeId;
  readonly type: 'element';
  readonly parentId: NodeId;
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
function getNode(dom: StudioDom, nodeId: NodeId): StudioNode {
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

export function getChildren(
  dom: StudioDom,
  parent: StudioPageNode | StudioElementNode,
): StudioElementNode[] {
  return parent.children.map((nodeId) => {
    const page = getNode(dom, nodeId);
    assertIsElement(page);
    return page;
  });
}

export function getParent(dom: StudioDom, child: StudioAppNode): null;
export function getParent(dom: StudioDom, child: StudioApiNode): StudioAppNode;
export function getParent(dom: StudioDom, child: StudioPageNode): StudioAppNode;
export function getParent(dom: StudioDom, child: StudioThemeNode): StudioAppNode;
export function getParent(
  dom: StudioDom,
  child: StudioElementNode,
): StudioPageNode | StudioElementNode;
export function getParent(dom: StudioDom, child: StudioNode): StudioNode | null {
  if (child.parentId) {
    const parent = getNode(dom, child.parentId);
    return parent;
  }
  return null;
}
