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
    | 'GridColumns'; // GridColumns specialized editor
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
  name?: string;
  typeDef: PropValueType;
  required?: boolean;
  defaultValue?: any;
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

export type LiveBindings = Partial<Record<string, LiveBinding>>;

export type { PlaceholderProps, SlotsProps, StudioRuntimeNode, RuntimeError } from './runtime';
export { Placeholder, Slots, useStudioNode } from './runtime';

export type FlowDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

export type { UseDataQuery } from './useDataQuery.js';
export * from './useDataQuery.js';

export type { UseFetchedState } from './useFetchedState.js';
export { default as useFetchedState } from './useFetchedState.js';

export { default as useUrlQueryState } from './useUrlQueryState.js';

export * from './constants.js';
