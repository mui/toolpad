import type * as React from 'react';
import type { Branded, WithControlledProp } from './utils/types';
import type { Rectangle } from './utils/geometry';

export interface DefaultNodeProps {
  [prop: string]: unknown;
}

export interface EditorProps<T> {
  name: string;
  disabled?: boolean;
  value: T;
  onChange: (newValue: T) => void;
}

export interface PropTypeDefinition<T> {
  Editor: React.FC<EditorProps<T>>;
}

export type PropTypeOf<T extends PropTypeDefinition<any>> = T extends PropTypeDefinition<infer U>
  ? U
  : never;

export interface StudioNodeBindings {
  [destProp: string]: string;
}

export interface StudioPageBindings {
  [destNodeId: NodeId]: StudioNodeBindings | undefined;
}

export interface StudioStateDefinition {
  name: string;
  initialValue: any;
  // TODO: state type?
}

export interface StudioBoundProp {
  type: 'binding';
  state: string;
}

export interface StudioConstantProp<V> {
  type: 'const';
  value: V;
}

export type StudioNodeProp<V> = StudioConstantProp<V> | StudioBoundProp;

export type StudioNodeProps<P = DefaultNodeProps> = {
  readonly [K in keyof P]: StudioNodeProp<P[K]> | undefined;
};

export type NodeId = Branded<string, 'NodeId'>;

export interface StudioApiSummary {
  id: string;
  name: string;
}

export interface StudioApi<Q = unknown> extends StudioApiSummary {
  connectionId: string;
  query: Q;
}

export type FlowDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

export interface SlotLocation {
  nodeId: NodeId;
  slot: string;
  index: number;
}

export interface SlotLayoutCenter {
  type: 'slot';
  name: string;
  index: number;
  rect: Rectangle;
}

export type SlotDirection = 'horizontal' | 'vertical';

export interface SlotLayoutInsert {
  type: 'insert';
  name: string;
  index: number;
  direction: SlotDirection;
  x: number;
  y: number;
  size: number;
}

export type SlotLayout = SlotLayoutCenter | SlotLayoutInsert;

export interface NodeLayoutSlots {
  [name: string]: SlotLayout[] | undefined;
}

export interface NodeState {
  nodeId: NodeId;
  rect: Rectangle;
  slots: NodeLayoutSlots;
  props: {
    [key: string]: unknown;
  };
}

export interface ViewState {
  [nodeId: NodeId]: NodeState | undefined;
}

export type StudioApiResultFields<D = {}> = {
  [K in keyof D]?: {
    type: string;
  };
};

export interface StudioApiResult<D = {}> {
  fields: StudioApiResultFields<D>;
  data: D[];
}

export type StudioConnectionParamsEditor<P = {}> = React.FC<WithControlledProp<P>>;
export type StudioQueryEditor<Q = {}> = React.FC<WithControlledProp<Q>>;

export interface ConnectionStatus {
  timestamp: number;
  error?: string;
}

export interface StudioDataSourceClient<P = {}, Q = {}> {
  displayName: string;
  needsConnection: boolean;
  ConnectionParamsInput: StudioConnectionParamsEditor<P>;
  getInitialConnectionValue: () => P;
  isConnectionValid: (connection: P) => boolean;
  QueryEditor: StudioQueryEditor<Q>;
  getInitialQueryValue: () => Q;
}

export interface StudioDataSourceServer<P = {}, Q = {}, D = {}> {
  test: (connection: StudioConnection<P>) => Promise<ConnectionStatus>;
  exec: (connection: StudioConnection<P>, query: Q) => Promise<StudioApiResult<D>>;
}

export interface StudioConnectionSummary {
  id: string;
  type: string;
  name: string;
}

export interface StudioConnection<P = {}> extends StudioConnectionSummary {
  params: P;
  status: ConnectionStatus | null;
}
