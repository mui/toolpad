import type * as React from 'react';
import * as express from 'express';
import { NodeId, PropValueType, ExecFetchResult, ScopeMeta } from '@mui/toolpad-core';
import { PaletteMode } from '@mui/material';
import type * as appDom from './appDom';
import type { Awaitable, Maybe, WithControlledProp } from './utils/types';

// These are set at runtime and passed to the browser.
// Do not add secrets
export interface RuntimeConfig {
  externalUrl: string;
}

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

export type Updates<O extends { id: string }> = Partial<O> & Pick<O, 'id'>;

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
  runtimeConfig: RuntimeConfig;
}

export type QueryEditor<C, Q, A extends Methods> = React.FC<QueryEditorProps<C, Q, A>>;

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
  // Functions or datasources have been updated
  functionsChanged: {};
};

export interface ToolpadProjectOptions {
  dev: boolean;
  externalUrl?: string;
  base: string;
  customServer: boolean;
}

export type CodeEditorFileType = 'resource' | 'component';

// TODO: Replace call sites import and remove this export
export type {
  AppCanvasState,
  PageViewState,
  NodesInfo,
  NodeInfo,
  FlowDirection,
} from '@mui/toolpad-core';
