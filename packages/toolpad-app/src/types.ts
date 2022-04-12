import type * as React from 'react';
import { NextApiRequest, NextApiResponse } from 'next';
import { GridRowsProp } from '@mui/x-data-grid-pro';
import type { Branded, WithControlledProp } from './utils/types';
import type { Rectangle } from './utils/geometry';

export interface UseDataQuery {
  loading: boolean;
  error: any;
  data: any;
  rows: GridRowsProp;
}

export type SlotType = 'single' | 'multiple';

export interface OnChangeHandler {
  params: string[];
  valueGetter: string;
}

export interface ValueTypeBase {
  type: 'string' | 'boolean' | 'number' | 'object' | 'array' | 'element';
}

export interface StringValueType extends ValueTypeBase {
  type: 'string';
  enum?: string[];
}

export interface NumberValueType extends ValueTypeBase {
  type: 'number';
  minimum?: number;
  maximum?: number;
}

export interface BooleanValueType extends ValueTypeBase {
  type: 'boolean';
}

export interface ObjectValueType extends ValueTypeBase {
  type: 'object';
  schema?: 'string';
}

export interface ArrayValueType extends ValueTypeBase {
  type: 'array';
  schema?: 'string';
}

export interface ElementValueType extends ValueTypeBase {
  type: 'element';
}

export interface ArgControlSpec {
  type:
    | 'boolean' // checkbox
    | 'number' // number input
    | 'range' // slider
    | 'object' // json editor
    | 'radio' // radio buttons
    | 'buttons' // button group
    | 'select' // select control
    | 'string' // text input
    | 'color' // color picker
    | 'slot' // slot in canvas
    | 'slots' // slots in canvas
    | 'multiSelect' // multi select ({ type: 'array', items: { type: 'enum', values: ['1', '2', '3'] } })
    | 'date' // date picker
    | 'json' // JSON editor
    | 'GridColumns' // GridColumns specialized editor
    | 'HorizontalAlign'
    | 'VerticalAlign';
}

type PrimitiveValueType =
  | StringValueType
  | NumberValueType
  | BooleanValueType
  | ObjectValueType
  | ArrayValueType;

export type PropValueType = PrimitiveValueType | ElementValueType;

export type PropValueTypes<K extends string = string> = Partial<{
  [key in K]?: PropValueType;
}>;

export interface ArgTypeDefinition {
  label?: string;
  typeDef: PropValueType;
  required?: boolean;
  description?: string;
  control?: ArgControlSpec;
  onChangeProp?: string;
  onChangeHandler?: OnChangeHandler;
  memoize?: boolean;
  defaultValueProp?: string;
}

export type ArgTypeDefinitions<P = any> = {
  [K in keyof P & string]?: ArgTypeDefinition;
};

export interface ComponentDefinition<P> {
  // props: PropDefinitions<P>;
  argTypes: ArgTypeDefinitions<P>;
}

export interface LiveBinding {
  value?: any;
  error?: Error;
}

export type RuntimeEvent = {
  type: 'propUpdated';
  nodeId: string;
  prop: string;
  value: React.SetStateAction<unknown>;
};

export interface ComponentConfig<P> {
  argTypes: ArgTypeDefinitions<P>;
}

export type LiveBindings = Partial<Record<string, LiveBinding>>;

export interface EditorProps<T> {
  nodeId: NodeId;
  propName: string;
  label: string;
  argType: ArgTypeDefinition;
  disabled?: boolean;
  value: T | undefined;
  onChange: (newValue: T) => void;
}

export interface PropControlDefinition<T = any> {
  Editor: React.FC<EditorProps<T>>;
}

export type BindingAttrValueFormat = 'stringLiteral' | 'default';

// TODO: Get rid of BoundExpressionAttrValue? Its function can be fulfilled by derivedState as well
export interface BoundExpressionAttrValue {
  type: 'boundExpression';
  value: string;
  format?: BindingAttrValueFormat;
}

export interface JsExpressionAttrValue {
  type: 'jsExpression';
  value: string;
}

export interface BindingAttrValue {
  type: 'binding';
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

export type BindableAttrValue<V> =
  | ConstantAttrValue<V>
  | BindingAttrValue
  | SecretAttrValue<V>
  | BoundExpressionAttrValue
  | JsExpressionAttrValue;

export type ConstantAttrValues<P> = { [K in keyof P]: ConstantAttrValue<P[K]> };

export type BindableAttrValues<P> = {
  readonly [K in keyof P]?: BindableAttrValue<P[K]>;
};

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
  error?: RuntimeError;
  rect?: Rectangle;
  slots?: SlotsState;
  component?: ComponentConfig<unknown>;
  props: { [key: string]: unknown };
}

export interface NodesInfo {
  [nodeId: NodeId]: NodeInfo | undefined;
}

export interface PageViewState {
  nodes: NodesInfo;
  pageState: Record<string, unknown>;
  bindings: LiveBindings;
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
export interface QueryEditorApi {
  fetchPrivate: (query: any) => Promise<any>;
}
export interface QueryEditorProps<Q> extends WithControlledProp<Q> {
  api: QueryEditorApi;
}
export type QueryEditor<Q = {}> = React.FC<QueryEditorProps<Q>>;

export interface ConnectionStatus {
  timestamp: number;
  error?: string;
}

export interface ClientDataSource<P = {}, Q = {}> {
  displayName: string;
  ConnectionParamsInput: ConnectionParamsEditor<P>;
  getInitialConnectionValue: () => P;
  isConnectionValid: (connection: P) => boolean;
  QueryEditor: QueryEditor<Q>;
  getInitialQueryValue: () => Q;
  getArgTypes?: (query: Q) => ArgTypeDefinitions;
}

export interface ServerDataSource<P = {}, Q = {}, D = {}> {
  test: (connection: LegacyConnection<P>) => Promise<ConnectionStatus>;
  // Execute a private query on this connection, intended for editors only
  execPrivate?: (connection: LegacyConnection<P>, query: any) => Promise<any>;
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

export interface RuntimeError {
  message: string;
  stack?: string;
}
