import type * as React from 'react';
import type { TOOLPAD_COMPONENT } from './constants.js';
import type { Branded } from './utils/types.js';

export type NodeId = Branded<string, 'NodeId'>;

export type BindingAttrValueFormat = 'stringLiteral' | 'default';

export interface NodeReference {
  $$ref: NodeId;
}

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
  | BindingAttrValue
  | SecretAttrValue<V>
  | BoundExpressionAttrValue
  | JsExpressionAttrValue
  | BindableAction;

export type ConstantAttrValues<P> = { [K in keyof P]: ConstantAttrValue<P[K]> };

export type NestedBindableAttrs =
  | BindableAttrValue<any>
  | BindableAttrValues<any>
  | [string, BindableAttrValue<any>][];

export type BindableAttrValues<P = Record<string, unknown>> = {
  readonly [K in keyof P]?: BindableAttrValue<P[K]>;
};

export type BindableAttrEntries = [string, BindableAttrValue<any>][];

export type SlotType = 'single' | 'multiple' | 'layout';

export interface ValueTypeBase {
  type: 'string' | 'boolean' | 'number' | 'object' | 'array' | 'element' | 'template' | 'event';
  default?: unknown;
}

export interface StringValueType extends ValueTypeBase {
  type: 'string';
  enum?: string[];
  default?: string;
}

export interface NumberValueType extends ValueTypeBase {
  type: 'number';
  minimum?: number;
  maximum?: number;
  default?: number;
}

export interface BooleanValueType extends ValueTypeBase {
  type: 'boolean';
  default?: boolean;
}

export interface ObjectValueType extends ValueTypeBase {
  type: 'object';
  schema?: string;
  default?: any;
}

export interface ArrayValueType extends ValueTypeBase {
  type: 'array';
  schema?: string;
  default?: any[];
}

export interface ElementValueType extends ValueTypeBase {
  type: 'element';
}

export interface TemplateValueType extends ValueTypeBase {
  type: 'template';
}

export interface EventValueType extends ValueTypeBase {
  type: 'event';
  arguments?: {
    name: string;
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
    | 'HorizontalAlign'
    | 'VerticalAlign'
    | 'event'
    | 'RowIdFieldSelect'; // Row id field specialized select
}

export type PrimitiveValueType =
  | StringValueType
  | NumberValueType
  | BooleanValueType
  | ObjectValueType
  | ArrayValueType;

export type PropValueType =
  | PrimitiveValueType
  | ElementValueType
  | TemplateValueType
  | EventValueType;

export type PropValueTypes<K extends string = string> = Partial<{
  [key in K]?: PropValueType;
}>;

export interface ArgTypeDefinition<P extends object = {}, V = P[keyof P]> {
  /**
   * A short explanatory text that'll be shown in the editor UI when this property is referenced.
   * May contain Markdown.
   */
  helperText?: string;
  /**
   * To be used instead of the property name for UI purposes in the editor.
   */
  label?: string;
  /**
   * Describes the type of the values this property can accept.
   */
  typeDef: PropValueType;
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
   * @deprecated Use `typeDef.default` instead.
   */
  defaultValue?: V;
  /**
   * The property that will supply the default value.
   */
  defaultValueProp?: V;
  /**
   * The property that is used to control this property.
   */
  onChangeProp?: string;
  /**
   * Provides a way to manipulate the value from the onChange event before it is assigned to state.
   * @param {...any} params params for the function assigned to [onChangeProp]
   * @returns {any} a value for the controlled prop
   */
  onChangeHandler?: (...params: any[]) => V;
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
}

export type ArgTypeDefinitions<P extends object = {}> = {
  [K in keyof P & string]?: ArgTypeDefinition<P, P[K]>;
};

export interface ComponentDefinition<P extends object = {}> {
  // props: PropDefinitions<P>;
  argTypes: ArgTypeDefinitions<P>;
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
      kind: 'query' | 'local';
    }
);

export type ScopeMeta = Partial<Record<string, ScopeMetaField>>;

export type RuntimeEvents = {
  propUpdated: {
    nodeId: string;
    prop: string;
    value: React.SetStateAction<unknown>;
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
  pageNavigationRequest: { pageNodeId: NodeId };
};

export type RuntimeEvent = {
  [K in keyof RuntimeEvents]: { type: K } & RuntimeEvents[K];
}[keyof RuntimeEvents];

export interface ComponentConfig<P extends object = {}> {
  /**
   * A short explanatory text that'll be shown in the editor UI when this component is referenced.
   * May contain Markdown
   */
  helperText?: string;
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
   * inputs is still loading it will set this property to true
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
   * Describes the individual properties for this component
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

export type PlainObject = Record<string, unknown>;

export interface SerializedError extends PlainObject {
  message: string;
  name: string;
  stack?: string;
  code?: unknown;
}

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
  evaluateExpression(code: string, globalScope: Record<string, unknown>): BindingEvaluationResult;
}

export type LocalScopeParams = Record<string, unknown>;

export interface TemplateScopeParams {
  i: number;
}

export type TemplateRenderer = ({ i }: TemplateScopeParams) => React.ReactNode;
