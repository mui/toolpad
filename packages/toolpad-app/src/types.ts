import type * as React from 'react';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  ArgTypeDefinition,
  RuntimeError,
  ComponentConfig,
  BindableAttrValues,
  LiveBinding,
} from '@mui/toolpad-core';

import { PaletteMode } from '@mui/material';
import type { Branded, Maybe, WithControlledProp } from './utils/types';
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

export type NodeId = Branded<string, 'NodeId'>;

export type FlowDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

export type Updates<O extends { id: string }> = Partial<O> & Pick<O, 'id'>;

export interface NodeInfo {
  nodeId: NodeId;
  error?: RuntimeError | null;
  rect?: Rectangle;
  componentConfig?: ComponentConfig<unknown>;
  direction: FlowDirection;
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

export interface CreateHandlerApi<P = unknown> {
  setConnectionParams: (appId: string, connectionId: string, props: P) => Promise<void>;
  getConnectionParams: (appId: string, connectionId: string) => Promise<P>;
}

export interface ConnectionEditorProps<P> extends WithControlledProp<P | null> {
  handlerBasePath: string;
  appId: string;
  connectionId: NodeId;
}
export type ConnectionParamsEditor<P = {}> = React.FC<ConnectionEditorProps<P>>;

export interface QueryEditorModel<Q> {
  query: Q;
  params?: BindableAttrValues<any>;
}

export interface QueryEditorProps<P, Q> extends WithControlledProp<QueryEditorModel<Q>> {
  connectionParams: Maybe<P>;
  globalScope: Record<string, any>;
  liveParams: Record<string, LiveBinding>;
}

export type QueryEditor<P, Q = {}> = React.FC<QueryEditorProps<P, Q>>;

export interface ConnectionStatus {
  timestamp: number;
  error?: string;
}

export interface ClientDataSource<P = {}, Q = {}> {
  displayName: string;
  ConnectionParamsInput: ConnectionParamsEditor<P>;
  isConnectionValid: (connection: P) => boolean;
  QueryEditor: QueryEditor<P, Q>;
  getInitialQueryValue: () => Q;
}

export interface ServerDataSource<P = {}, Q = {}, PQ = {}, D = {}> {
  // Execute a private query on this connection, intended for editors only
  execPrivate?: (connection: Maybe<P>, query: PQ) => Promise<any>;
  // Execute a query on this connection, intended for viewers
  exec: (connection: Maybe<P>, query: Q, params: any) => Promise<ApiResult<D>>;
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

export type VersionOrPreview = 'preview' | number;
