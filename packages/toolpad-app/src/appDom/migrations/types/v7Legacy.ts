import { BoxProps } from '@mui/system';
import { NodeId, NodeReference } from '@mui/toolpad-core';
import invariant from 'invariant';
import { PageDisplayMode } from '../..';
import { AppTheme, ConnectionStatus } from '../../../types';

export interface JsExpressionAttrValue {
  type: 'jsExpression';
  value: string;
}

export interface EnvAttrValue {
  type: 'env';
  value: string;
}

export interface ConstantAttrValue<V> {
  type: 'const';
  value: V;
}

export interface SecretAttrValue<V> {
  type: 'secret';
  value: V;
}

export interface JsExpressionAction {
  type: 'jsExpressionAction';
  value: string;
}

export interface NavigationAction<P = any> {
  type: 'navigationAction';
  value: {
    page: NodeReference;
    parameters?: BindableAttrValues<P>;
  };
}

export type BindableAction = JsExpressionAction | NavigationAction;

export type BindableAttrValue<V> =
  | ConstantAttrValue<V>
  | SecretAttrValue<V>
  | JsExpressionAttrValue
  | EnvAttrValue
  | BindableAction;

export type BindableAttrValues<P = Record<string, unknown>> = {
  readonly [K in keyof P]?: BindableAttrValue<P[K]>;
};

export type BindableAttrEntries = [string, BindableAttrValue<any>][];

type AppDomNodeType =
  | 'app'
  | 'connection'
  | 'theme'
  | 'page'
  | 'element'
  | 'codeComponent'
  | 'query'
  | 'mutation';

interface AppDomNodeBase {
  readonly id: NodeId;
  readonly type: AppDomNodeType;
  readonly name: string;
  readonly parentId: NodeId | null;
  readonly parentProp: string | null;
  readonly parentIndex: string | null;
  readonly attributes: {};
}

export interface AppNode extends AppDomNodeBase {
  readonly type: 'app';
  readonly parentId: null;
}

export interface ThemeNode extends AppDomNodeBase {
  readonly type: 'theme';
  readonly theme?: BindableAttrValues<AppTheme>;
}

export interface ConnectionNode<P = unknown> extends AppDomNodeBase {
  readonly type: 'connection';
  readonly attributes: {
    readonly dataSource: ConstantAttrValue<string>;
    readonly params: SecretAttrValue<P | null>;
    readonly status: ConstantAttrValue<ConnectionStatus | null>;
  };
}

export interface PageNode extends AppDomNodeBase {
  readonly type: 'page';
  readonly attributes: {
    readonly title: ConstantAttrValue<string>;
    readonly parameters?: ConstantAttrValue<[string, string][]>;
    readonly module?: ConstantAttrValue<string>;
    readonly display?: ConstantAttrValue<PageDisplayMode>;
  };
}

export interface ElementNode<P = any> extends AppDomNodeBase {
  readonly type: 'element';
  readonly attributes: {
    readonly component: ConstantAttrValue<string>;
  };
  readonly props?: BindableAttrValues<P>;
  readonly layout?: {
    readonly horizontalAlign?: ConstantAttrValue<BoxProps['justifyContent']>;
    readonly verticalAlign?: ConstantAttrValue<BoxProps['alignItems']>;
    readonly columnSize?: ConstantAttrValue<number>;
  };
}

export interface CodeComponentNode extends AppDomNodeBase {
  readonly type: 'codeComponent';
  readonly attributes: {
    readonly code: ConstantAttrValue<string>;
    readonly isNew?: ConstantAttrValue<boolean>;
  };
}

export type FetchMode = 'query' | 'mutation';

export interface QueryNode<Q = any> extends AppDomNodeBase {
  readonly type: 'query';
  readonly params?: BindableAttrEntries;
  readonly attributes: {
    readonly mode?: ConstantAttrValue<FetchMode>;
    readonly dataSource?: ConstantAttrValue<string>;
    readonly connectionId: ConstantAttrValue<NodeReference | null>;
    readonly query: ConstantAttrValue<Q>;
    readonly transform?: ConstantAttrValue<string>;
    readonly transformEnabled?: ConstantAttrValue<boolean>;
    /** @deprecated Not necessary to be user-facing, we will expose staleTime instead if necessary */
    readonly refetchOnWindowFocus?: ConstantAttrValue<boolean>;
    /** @deprecated Not necessary to be user-facing, we will expose staleTime instead if necessary */
    readonly refetchOnReconnect?: ConstantAttrValue<boolean>;
    readonly refetchInterval?: ConstantAttrValue<number>;
    readonly cacheTime?: ConstantAttrValue<number>;
    readonly enabled?: BindableAttrValue<boolean>;
  };
}

export interface MutationNode<Q = any> extends AppDomNodeBase {
  readonly type: 'mutation';
  readonly params?: BindableAttrValues;
  readonly attributes: {
    readonly dataSource?: ConstantAttrValue<string>;
    readonly connectionId: ConstantAttrValue<NodeReference | null>;
    readonly query: ConstantAttrValue<Q>;
  };
}

type AppDomNodeOfType<K extends AppDomNodeType> = {
  app: AppNode;
  connection: ConnectionNode;
  theme: ThemeNode;
  page: PageNode;
  element: ElementNode;
  codeComponent: CodeComponentNode;
  query: QueryNode;
  mutation: MutationNode;
}[K];

export type AppDomNode = AppDomNodeOfType<AppDomNodeType>;

export type AppDomNodes = Record<NodeId, AppDomNode>;

export interface AppDom {
  nodes: AppDomNodes;
  root: NodeId;
  version?: number;
}

function isType<T extends AppDomNode>(node: AppDomNode, type: T['type']): node is T {
  return node.type === type;
}

function assertIsType<T extends AppDomNode>(node: AppDomNode, type: T['type']): asserts node is T {
  invariant(isType(node, type), `Expected node type "${type}" but got "${node.type}"`);
}

export function isElement<P>(node: AppDomNode): node is ElementNode<P> {
  return isType<ElementNode>(node, 'element');
}

export function assertIsElement<P>(node: AppDomNode): asserts node is ElementNode<P> {
  assertIsType<ElementNode>(node, 'element');
}

export function isQuery<P>(node: AppDomNode): node is QueryNode<P> {
  return isType<QueryNode>(node, 'query');
}
