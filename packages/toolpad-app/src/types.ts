import type * as React from 'react';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  SlotType,
  RuntimeError,
  ComponentConfig,
  NodeId,
  PropValueType,
  ExecFetchResult,
  ScopeMeta,
} from '@mui/toolpad-core';
import { PaletteMode } from '@mui/material';
import type * as appDom from './appDom';
import type { Maybe, WithControlledProp } from './utils/types';
import type { Rectangle } from './utils/geometry';

declare global {
  interface Error {
    code?: unknown;
  }
}

export interface EditorProps<T> {
  /**
   * @deprecated
   * `nodeId` is only needed for very specific editors. Maybe this rather belongs in some context?
   */
  nodeId?: NodeId;
  label: string;
  propType: PropValueType;
  disabled?: boolean;
  value: T | undefined;
  onChange: (newValue: T | undefined) => void;
}

export type FlowDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

export type Updates<O extends { id: string }> = Partial<O> & Pick<O, 'id'>;

export interface SlotLocation {
  parentId: NodeId;
  parentProp: string;
  parentIndex?: string;
}

export interface SlotState {
  type: SlotType;
  rect: Rectangle;
  flowDirection: FlowDirection;
}

export interface SlotsState {
  [prop: string]: SlotState | undefined;
}

export interface NodeInfo {
  nodeId: NodeId;
  error?: RuntimeError | null;
  rect?: Rectangle;
  slots?: SlotsState;
  componentConfig?: ComponentConfig;
  props: { [key: string]: unknown };
}

export interface NodesInfo {
  [nodeId: NodeId]: NodeInfo | undefined;
}

export interface PageViewState {
  nodes: NodesInfo;
}

export interface CreateHandlerApi<P = unknown> {
  setConnectionParams: (connectionId: string, props: P) => Promise<void>;
  getConnectionParams: (connectionId: string) => Promise<P>;
}

export interface ConnectionEditorProps<P> extends WithControlledProp<P | null> {
  handlerBasePath: string;
  connectionId: NodeId;
}
export type ConnectionParamsEditor<P = {}> = React.FC<ConnectionEditorProps<P>>;

export interface QueryEditorProps<C, Q> extends WithControlledProp<appDom.QueryNode<Q>> {
  connectionParams: Maybe<C>;
  globalScope: Record<string, any>;
  globalScopeMeta: ScopeMeta;
  onChange: React.Dispatch<React.SetStateAction<appDom.QueryNode<Q>>>;
  onCommit?: () => void;
}

export type QueryEditor<C, Q> = React.FC<QueryEditorProps<C, Q>>;

export interface ConnectionStatus {
  timestamp: number;
  error?: string;
}

export interface ExecFetchFn<Q, R extends ExecFetchResult> {
  (fetchQuery: Q, params: Record<string, string>): Promise<R>;
}

export interface ExecClientFetchFn<Q, R extends ExecFetchResult> {
  (fetchQuery: Q, params: Record<string, string>, serverFetch: ExecFetchFn<Q, R>): Promise<R>;
}

export interface ClientDataSource<C = {}, Q = {}> {
  displayName: string;
  ConnectionParamsInput?: ConnectionParamsEditor<C>;
  transformQueryBeforeCommit?: (query: Q) => Q;
  QueryEditor: QueryEditor<C, Q>;
  getInitialQueryValue: () => Q;
  hasDefault?: boolean;
}

export interface RuntimeDataSource<Q = {}, R extends ExecFetchResult = ExecFetchResult> {
  exec?: ExecClientFetchFn<Q, R>;
}

export interface ServerDataSource<P = {}, Q = {}, PQ = {}, D = {}> {
  // Execute a private query on this connection, intended for editors only
  execPrivate?: (connection: Maybe<P>, query: PQ) => Promise<unknown>;
  // Execute a query on this connection, intended for viewers
  exec: (connection: Maybe<P>, query: Q, params: any) => Promise<ExecFetchResult<D>>;
  createHandler?: () => (
    api: CreateHandlerApi<P>,
    req: NextApiRequest,
    res: NextApiResponse,
  ) => void;
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
  'palette.mode'?: PaletteMode;
  'palette.primary.main'?: string;
  'palette.secondary.main'?: string;
}

export type AppVersion = 'development' | 'preview' | number;

export type AppTemplateId = 'default' | 'hr' | 'images';

export type NodeHashes = Record<NodeId, number | undefined>;

/**
 * Defines all the data needed to render the runtime.
 * While the dom is optimized for storage and editing. It isn't the ideal format used to render the application
 * `RuntimeData` will hold all data to render a toolpad app and will contain things like:
 * - precompile assets, like code component modules
 * - precompiled expressions
 * - datastructures optimized for rendering with less processing required
 * - ...
 */
export interface RuntimeState {
  // We start out with just the rendertree. The ultimate goal will be to move things out of this tree
  dom: appDom.RenderTree;
}
