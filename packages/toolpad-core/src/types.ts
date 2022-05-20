import React from 'react';
import { TOOLPAD_COMPONENT } from './constants';

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

export type SlotType = 'single' | 'multiple';

export interface ValueTypeBase {
  type: 'string' | 'boolean' | 'number' | 'object' | 'array' | 'element' | 'function';
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
  schema?: string;
}

export interface ArrayValueType extends ValueTypeBase {
  type: 'array';
  schema?: string;
}

export interface ElementValueType extends ValueTypeBase {
  type: 'element';
}

export interface FunctionValueType extends ValueTypeBase {
  type: 'function';
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
    | 'VerticalAlign'
    | 'function'
    | 'RowIdFieldSelect'; // Row id field specialized select
}

type PrimitiveValueType =
  | StringValueType
  | NumberValueType
  | BooleanValueType
  | ObjectValueType
  | ArrayValueType;

export type PropValueType = PrimitiveValueType | ElementValueType | FunctionValueType;

export type PropValueTypes<K extends string = string> = Partial<{
  [key in K]?: PropValueType;
}>;

export interface ArgTypeDefinition<V = unknown> {
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
   */
  defaultValue?: V;
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
}

export type ArgTypeDefinitions<P = any> = {
  [K in keyof P & string]?: ArgTypeDefinition<P[K]>;
};

export interface ComponentDefinition<P> {
  // props: PropDefinitions<P>;
  argTypes: ArgTypeDefinitions<P>;
}

export interface LiveBindingError {
  message: string;
  stack?: string;
}

export interface LiveBinding {
  value?: any;
  error?: LiveBindingError;
}

export type RuntimeEvent =
  | {
      type: 'propUpdated';
      nodeId: string;
      prop: string;
      value: React.SetStateAction<unknown>;
    }
  | {
      type: 'pageStateUpdated';
      pageState: Record<string, unknown>;
    }
  | {
      type: 'pageBindingsUpdated';
      bindings: LiveBindings;
    };

export interface ComponentConfig<P> {
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
   * Describes the individual properties for this component
   */
  argTypes: ArgTypeDefinitions<P>;
}

export type ToolpadComponent<P = {}> = React.ComponentType<P> & {
  [TOOLPAD_COMPONENT]: ComponentConfig<P>;
};

export type LiveBindings = Partial<Record<string, LiveBinding>>;

export interface RuntimeError {
  message: string;
  stack?: string;
}

export type FlowDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
