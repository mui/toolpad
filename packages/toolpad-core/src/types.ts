import type * as React from 'react';
import type { Branded } from '@mui/toolpad-utils/types';
import type { SerializedError } from '@mui/toolpad-utils/errors';
import type { JSONSchema7 } from 'json-schema';
import type { TOOLPAD_COMPONENT } from './constants';

export type NodeId = Branded<string, 'NodeId'>;

export interface NodeReference {
  $ref: NodeId;
}

export interface JsExpressionAttrValue {
  $$jsExpression: string;
}

export interface EnvAttrValue {
  $$env: string;
}

export interface SecretAttrValue<V> {
  $$secret: V;
}

export interface JsExpressionAction {
  $$jsExpressionAction: string;
}

export interface NavigationAction<P = any> {
  $$navigationAction: {
    page: string;
    parameters?: BindableAttrValues<P>;
  };
}

export type BindableAction = JsExpressionAction | NavigationAction;

export type BindableAttrValue<V> =
  | V
  | SecretAttrValue<V>
  | JsExpressionAttrValue
  | EnvAttrValue
  | BindableAction;

export type NestedBindableAttrs =
  | BindableAttrValue<any>
  | BindableAttrValues<any>
  | [string, BindableAttrValue<any>][];

export type BindableAttrValues<P = Record<string, unknown>> = {
  readonly [K in keyof P]?: BindableAttrValue<P[K]>;
};

export type BindableAttrEntries = [string, BindableAttrValue<any>][];

export type PropBindableAttrValue<V> = V | JsExpressionAttrValue | EnvAttrValue;

export type SlotType = 'single' | 'multiple' | 'layout';

export interface ValueTypeBase {
  /**
   * Specifies the type of the value.
   */
  type?: 'string' | 'boolean' | 'number' | 'object' | 'array' | 'element' | 'template' | 'event';
  /**
   * A default value for the property.
   */
  default?: unknown;
  /**
   * A short explanatory text that'll be shown in the editor UI when this property is referenced.
   * May contain Markdown.
   */
  helperText?: string;
}

export interface AnyValueType extends ValueTypeBase {
  type?: undefined;
  default?: any;
}

export interface StringValueType extends ValueTypeBase {
  /**
   * the property is a string.
   */
  type: 'string';
  /**
   * The different possible values for the property.
   */
  enum?: string[];
  enumLabels?: Record<string, string>;
  default?: string;
}

export interface NumberValueType extends ValueTypeBase {
  /**
   * the property is a number.
   */
  type: 'number';
  /**
   * A minimum value for the property.
   */
  minimum?: number;
  /**
   * A maximum value for the property.
   */
  maximum?: number;
  default?: number;
}

export interface BooleanValueType extends ValueTypeBase {
  /**
   * the property is a boolean.
   */
  type: 'boolean';
  default?: boolean;
}

export interface ObjectValueType extends ValueTypeBase {
  /**
   * the property is an object.
   */
  type: 'object';
  /**
   * A JSON schema describing the object.
   */
  schema?: JSONSchema7;
  default?: any;
}

export interface ArrayValueType extends ValueTypeBase {
  /**
   * the property is an array.
   */
  type: 'array';
  /**
   * A JSON schema describing the array.
   */
  schema?: JSONSchema7;
  default?: any[];
}

export interface ElementValueType extends ValueTypeBase {
  /**
   * the property is a React.ReactNode.
   */
  type: 'element';
}

export interface TemplateValueType extends ValueTypeBase {
  /**
   * the property is a render function.
   */
  type: 'template';
}

export interface EventValueType extends ValueTypeBase {
  /**
   * the property is an event handler.
   */
  type: 'event';
  /**
   * Description of the handler's arguments.
   */
  arguments?: {
    /**
     * The argument's name.
     */
    name: string;
    /**
     * The argument's type.
     */
    tsType: string;
  }[];
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
    | 'layoutSlot' // slot with inner layout
    | 'multiSelect' // multi select ({ type: 'array', items: { type: 'enum', values: ['1', '2', '3'] } })
    | 'date' // date picker
    | 'json' // JSON editor
    | 'markdown' // Markdown editor
    | 'GridColumns' // GridColumns specialized editor
    | 'SelectOptions' // SelectOptions specialized editor
    | 'ChartData' // Chart data series specialized editor
    | 'HorizontalAlign'
    | 'VerticalAlign'
    | 'event'
    | 'NumberFormat'
    | 'ColorScale'
    | 'ToggleButtons'
    | 'RowIdFieldSelect' // Row id field specialized select
    | 'DataProviderSelector'; // Row id field specialized select
  bindable?: boolean;
  hideLabel?: boolean;
}

export type PrimitiveValueType =
  | StringValueType
  | NumberValueType
  | BooleanValueType
  | ObjectValueType
  | ArrayValueType;

export type PropValueType =
  | AnyValueType
  | PrimitiveValueType
  | ElementValueType
  | TemplateValueType
  | EventValueType;

export interface ParameterTypeLookup {
  number: number;
  string: string;
  boolean: boolean;
  array: unknown[];
  object: Record<string, unknown>;
  element: React.ReactNode;
  template: () => React.ReactNode;
  event: (...args: any[]) => void;
}

export type JsonSchemaToTs<T extends JSONSchema7> = T extends {
  type: 'object';
  properties?: Record<string, JSONSchema7>;
}
  ? {
      [K in keyof T['properties']]?: JsonSchemaToTs<NonNullable<T['properties']>[K]>;
    }
  : T extends { type: 'array'; items?: JSONSchema7 }
  ? T['items'] extends undefined
    ? unknown[]
    : JsonSchemaToTs<NonNullable<T['items']>>[]
  : T extends { type: 'string' }
  ? string
  : T extends { type: 'number' | 'integer' }
  ? number
  : T extends { type: 'boolean' }
  ? boolean
  : T extends { type: 'null' }
  ? null
  : unknown;

export type InferParameterType<T extends PropValueType> = T extends {
  type: 'object' | 'array';
  schema: JSONSchema7;
}
  ? JsonSchemaToTs<T['schema']>
  : ParameterTypeLookup[NonNullable<T['type']>];

export type PropValueTypes<K extends string = string> = Partial<{
  [key in K]?: PropValueType;
}>;

export type ArgTypeDefinition<
  P extends object = {},
  K extends keyof P = keyof P,
> = PropValueType & {
  /**
   * To be used instead of the property name for UI purposes in the editor.
   */
  label?: string;
  /**
   * The control to be used to manipulate values for this property from the editor.
   */
  control?: ArgControlSpec;
  /**
   * A description of the property, to be used to supply extra information to the user.
   */
  description?: string;
  /**
   * A default value for the property.
   * @deprecated Use `default` instead.
   */
  defaultValue?: P[K];
  /**
   * The property that will supply the default value.
   */
  defaultValueProp?: keyof P & string;
  /**
   * The property that is used to control this property.
   */
  onChangeProp?: keyof P & string;
  /**
   * Provides a way to manipulate the value from the onChange event before it is assigned to state.
   * @param {...any} params params for the function assigned to [onChangeProp]
   * @returns {any} a value for the controlled prop
   */
  onChangeHandler?: (...params: any[]) => P[K];
  /**
   * For compound components, this property is used to control the visibility of this property based on the selected value of another property.
   * If this property is not defined, the property will be visible at all times.
   * @param {P} props all the prop bindings of the component
   * @returns {boolean} a boolean value indicating whether the property should be visible or not
   */
  visible?: ((props: P) => boolean) | boolean;
  /**
   * Name of category that this property belongs to.
   */
  category?: string;
  tsType?: string;
};

export type ArgTypeDefinitions<P extends object = {}> = {
  [K in keyof P & string]?: ArgTypeDefinition<P, K>;
};

export interface ComponentDefinition<P extends object = {}> {
  argTypes?: ArgTypeDefinitions<P>;
}

export interface LiveBindingError {
  message: string;
  stack?: string;
}

/**
 * Represents the actual state of an evaluated binding.
 */
export type BindingEvaluationResult<T = unknown> = {
  /**
   * The actual value.
   */
  value?: T;
  /**
   * The evaluation of the value resulted in error.
   */
  error?: Error;
  /**
   * The parts that this value depends on are still loading.
   */
  loading?: boolean;
};

export type LiveBinding = BindingEvaluationResult;

export interface ScopeMetaPropField {
  tsType?: string;
}

export type ScopeMetaField = {
  description?: string;
  deprecated?: boolean | string;
  tsType?: string;
} & (
  | {
      kind?: undefined;
    }
  | {
      kind: 'element';
      componentId: string;
      props?: Record<string, ScopeMetaPropField>;
    }
  | {
      kind: 'query' | 'action' | 'local';
    }
);

export type ScopeMeta = Partial<Record<string, ScopeMetaField>>;

export type RuntimeEvents = {
  propUpdated: {
    nodeId: string;
    prop: string;
    value: React.SetStateAction<unknown>;
  };
  editorNodeDataUpdated: {
    nodeId: NodeId;
    prop: string;
    value: any;
  };
  pageStateUpdated: {
    pageState: Record<string, unknown>;
    globalScopeMeta: ScopeMeta;
  };
  pageBindingsUpdated: {
    bindings: LiveBindings;
  };
  screenUpdate: {};
  ready: {};
  pageNavigationRequest: { pageName: string };
  vmUpdated: { vm: ApplicationVm };
};

export type RuntimeEvent = {
  [K in keyof RuntimeEvents]: { type: K } & RuntimeEvents[K];
}[keyof RuntimeEvents];

export interface ComponentConfig<P extends object = {}> {
  /**
   * A short explanatory text that'll be shown in the editor UI when this component is referenced.
   * May contain Markdown.
   */
  helperText?: string;
  /**
   * Configures which properties result in propagating error state to `errorProp`.
   */
  errorPropSource?: (keyof P & string)[];
  /**
   * Designates a property as "the error property". If Toolpad detects an error
   * on any of the inputs, it will forward it to this property.
   */
  errorProp?: keyof P & string;
  /**
   * Configures which properties result in propagating loading state to `loadingProp`.
   */
  loadingPropSource?: (keyof P & string)[];
  /**
   * Designates a property as "the loading property". If Toolpad detects any of the
   * inputs is still loading it will set this property to `true`.
   */
  loadingProp?: keyof P & string;
  /**
   * Enables controlling the aligment of the component container box.
   */
  layoutDirection?: 'vertical' | 'horizontal' | 'both';
  /**
   * Designates a property as "the resizable height property". If Toolpad detects any
   * vertical resizing of the component it will forward it to this property.
   */
  resizableHeightProp?: keyof P & string;
  /**
   * Describes the individual properties for this component.
   */
  argTypes?: ArgTypeDefinitions<P>;
}

export type ToolpadComponent<P extends object = {}> = React.ComponentType<P> & {
  [TOOLPAD_COMPONENT]: ComponentConfig<P>;
};

export type ToolpadComponents = Partial<Record<string, ToolpadComponent<any>>>;

export type LiveBindings = Partial<Record<string, LiveBinding>>;

export interface RuntimeError {
  message: string;
  stack?: string;
}

export type FlowDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

export type ExecFetchResult<T = any> = {
  data?: T;
  error?: SerializedError;
};

export type Serializable =
  | string
  | number
  | boolean
  | null
  | undefined
  | Serializable[]
  | { [key: string]: Serializable }
  | ((...args: Serializable[]) => Serializable);

export interface JsRuntime {
  getEnv(): Record<string, string | undefined>;
  evaluateExpression(code: string, globalScope: Record<string, unknown>): BindingEvaluationResult;
}

export type TemplateRenderer = (
  scopeKey: string,
  params: Record<string, unknown>,
) => React.ReactNode;

export interface RuntimeScope {
  id: string;
  parentScope?: RuntimeScope;
  bindings: Record<string, BindingEvaluationResult<unknown>>;
  values: Record<string, unknown>;
  meta: ScopeMeta;
}

export interface ApplicationVm {
  scopes: { [id in string]?: RuntimeScope };
  bindingScopes: { [id in string]?: string };
}

export interface IndexPaginationModel {
  start: number;
  pageSize: number;
}

export interface CursorPaginationModel {
  cursor: string | null;
  pageSize: number;
}

export interface FilterModelItem {
  field: string;
  operator: string;
  value: unknown;
}

export type LogicOperator = 'and' | 'or';

export interface FilterModel {
  items: FilterModelItem[];
  logicOperator: LogicOperator;
}

export type SortDirection = 'asc' | 'desc';

export interface SortItem {
  field: string;
  sort: SortDirection;
}

export type SortModel = SortItem[];

export type PaginationMode = 'index' | 'cursor';

export type PaginationModel<M extends PaginationMode = PaginationMode> = M extends 'cursor'
  ? CursorPaginationModel
  : IndexPaginationModel;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface GetRecordsParams<R, P extends PaginationMode> {
  paginationModel: PaginationModel<P>;
  filterModel: FilterModel;
  sortModel: SortModel;
}

export interface GetRecordsResult<R, P extends PaginationMode> {
  records: R[];
  hasNextPage?: boolean;
  totalCount?: number;
  cursor?: P extends 'cursor' ? string | null : undefined;
}

export interface ToolpadDataProviderBase<
  R extends Record<string, unknown> = {},
  P extends PaginationMode = 'index',
> {
  paginationMode?: P;
  getRecords: (params: GetRecordsParams<R, P>) => Promise<GetRecordsResult<R, P>>;
  deleteRecord?: (id: string | number) => Promise<void>;
  updateRecord?: (id: string | number, record: Partial<R>) => Promise<void>;
  createRecord?: (record: R) => Promise<void>;
}

export type NodeHashes = Record<NodeId, number | undefined>;
