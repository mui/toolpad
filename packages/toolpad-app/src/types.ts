import type * as React from 'react';
import * as express from 'express';
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
import type { Awaitable, Maybe, WithControlledProp } from './utils/types';
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

export type Methods = Record<string, (...args: any[]) => Awaitable<any>>;

export interface QueryEditorProps<C, Q, A extends Methods = {}>
  extends WithControlledProp<appDom.QueryNode<Q>> {
  connectionParams: Maybe<C>;
  execApi: <K extends keyof A>(
    query: K,
    args: Parameters<A[K]>,
  ) => Promise<Awaited<ReturnType<A[K]>>>;
  globalScope: Record<string, any>;
  globalScopeMeta: ScopeMeta;
  onChange: React.Dispatch<React.SetStateAction<appDom.QueryNode<Q>>>;
  onCommit?: () => void;
}

export type QueryEditor<C, Q, A extends Methods> = React.FC<QueryEditorProps<C, Q, A>>;

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

export interface ClientDataSource<C = {}, Q = {}, A extends Methods = {}> {
  displayName: string;
  ConnectionParamsInput?: ConnectionParamsEditor<C>;
  transformQueryBeforeCommit?: (query: Q) => Q;
  QueryEditor: QueryEditor<C, Q, A>;
  getInitialQueryValue: () => Q;
  hasDefault?: boolean;
}

export interface RuntimeDataSource<Q = {}, R extends ExecFetchResult = ExecFetchResult> {
  exec?: ExecClientFetchFn<Q, R>;
}

export interface ServerDataSource<P = {}, Q = {}, PQ = {}, A extends Methods = {}> {
  // Execute a private query on this connection, intended for editors only
  execPrivate?: (connection: Maybe<P>, query: PQ) => Promise<unknown>;
  // Private api to be used by query editors
  api: A;
  // Execute a query on this connection, intended for viewers
  exec: (connection: Maybe<P>, query: Q, params: any) => Promise<ExecFetchResult<any>>;
  createHandler?: () => (
    api: CreateHandlerApi<P>,
    req: express.Request,
    res: express.Response,
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

export interface AppCanvasState extends RuntimeState {
  savedNodes: NodeHashes;
}

export type ProjectEvents = {
  // a change in the DOM
  change: {};
  // a change in the DOM caused by an external action (e.g. user editing a file outside of toolpad)
  externalChange: {};
  // a component has been added or removed
  componentsListChanged: {};
  // the function runtime build has finished
  queriesInvalidated: {};
  // An environment variable has changed
  envChanged: {};
};

export interface ToolpadProjectOptions {
  cmd: 'dev' | 'start' | 'build';
  dev: boolean;
}
