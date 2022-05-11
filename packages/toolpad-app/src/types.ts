import type * as React from 'react';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  ArgTypeDefinition,
  ArgTypeDefinitions,
  SlotType,
  RuntimeError,
  ComponentConfig,
} from '@mui/toolpad-core';
import type { Branded, WithControlledProp } from './utils/types';
import type { Rectangle } from './utils/geometry';

export interface EditorProps<T> {
  /**
   * @deprecated
   * `nodeId` is only needed for very specific editors. Maybe this rather belongs in some context?
   */
  nodeId?: NodeId;
  label: string;
  argType: ArgTypeDefinition;
  disabled?: boolean;
  value: T | undefined;
  onChange: (newValue: T) => void;
}

export interface PropControlDefinition<T = any> {
  Editor: React.FC<EditorProps<T>>;
}

export type NodeId = Branded<string, 'NodeId'>;

export type FlowDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

export type Updates<O extends { id: string }> = Partial<O> & Pick<O, 'id'>;

export interface SlotLocation {
  parentId: NodeId;
  parentProp: string;
  parentIndex?: string;
}

export type SlotDirection = 'horizontal' | 'vertical';

export interface SlotState {
  type: SlotType;
  rect: Rectangle;
  direction: FlowDirection;
}

export interface SlotsState {
  [prop: string]: SlotState | undefined;
}

export interface NodeInfo {
  nodeId: NodeId;
  error?: RuntimeError | null;
  rect?: Rectangle;
  slots?: SlotsState;
  componentConfig?: ComponentConfig<unknown>;
  props: { [key: string]: unknown };
}

export interface NodesInfo {
  [nodeId: NodeId]: NodeInfo | undefined;
}

export interface PageViewState {
  nodes: NodesInfo;
}

export type ApiResultFields<D = any> = {
  [K in keyof D]?: {
    type: string;
  };
};

export interface ApiResult<D = any> {
  data: D;
  fields?: ApiResultFields;
}

export interface PrivateApiResult<D = any> {
  data?: D;
  isLoading: boolean;
  isIdle: boolean;
  isSuccess: boolean;
}

export interface CreateHandlerApi {
  updateConnection: (appId: string, props: Updates<LegacyConnection>) => Promise<LegacyConnection>;
  getConnection: (appId: string, connectionId: string) => Promise<LegacyConnection>;
}

export interface ConnectionEditorProps<P> extends WithControlledProp<P> {
  handlerBasePath: string;
  appId: string;
  connectionId: NodeId;
}
export type ConnectionParamsEditor<P = {}> = React.FC<ConnectionEditorProps<P>>;

export interface QueryEditorApi<PQ> {
  fetchPrivate: (query: PQ) => Promise<PrivateApiResult<any>>;
}

export interface QueryEditorProps<Q, PQ = {}> extends WithControlledProp<Q> {
  api: QueryEditorApi<PQ>;
  globalScope: Record<string, any>;
}

export type QueryEditor<Q = {}, PQ = {}> = React.FC<QueryEditorProps<Q, PQ>>;

export interface ConnectionStatus {
  timestamp: number;
  error?: string;
}

export interface ClientDataSource<P = {}, Q = {}, PQ = {}> {
  displayName: string;
  ConnectionParamsInput: ConnectionParamsEditor<P>;
  getInitialConnectionValue: () => P;
  isConnectionValid: (connection: P) => boolean;
  QueryEditor: QueryEditor<Q, PQ>;
  getInitialQueryValue: () => Q;
  getArgTypes?: (query: Q) => ArgTypeDefinitions;
}

export interface ServerDataSource<P = {}, Q = {}, PQ = {}, D = {}> {
  test: (connection: LegacyConnection<P>) => Promise<ConnectionStatus>;
  // Execute a private query on this connection, intended for editors only
  execPrivate?: (connection: LegacyConnection<P>, query: PQ) => Promise<PrivateApiResult<any>>;
  // Execute a query on this connection, intended for viewers
  exec: (connection: LegacyConnection<P>, query: Q, params: any) => Promise<ApiResult<D>>;
  createHandler?: () => (api: CreateHandlerApi, req: NextApiRequest, res: NextApiResponse) => void;
}
// TODO: replace LegacyConnection with ConnectionNode
export interface LegacyConnection<P = unknown> {
  id: string;
  type: string;
  name: string;
  params: P;
  status: ConnectionStatus | null;
}

/**
 * Anything that can be inlined as the content of a JSX element
 */
export interface JsxFragmentExpression {
  type: 'jsxFragment';
  value: string;
}

/**
 * Anything that can be inlined as the RHS of an assignment
 */
export interface JsExpression {
  type: 'expression';
  value: string;
}

/**
 * Anything that can be inlined as a single JSX element
 */
export interface JsxElement {
  type: 'jsxElement';
  value: string;
}

export type PropExpression = JsxFragmentExpression | JsExpression | JsxElement;

export type ResolvedProps = Record<string, PropExpression | undefined>;

export interface AppTheme {
  'palette.primary.main'?: string;
  'palette.secondary.main'?: string;
}

export type VersionOrPreview = 'preview' | number;
