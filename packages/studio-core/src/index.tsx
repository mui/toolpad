export type SlotType = 'single' | 'multiple';

export interface OnChangeHandler {
  params: ['event'];
  valueGetter: 'event.target.value';
}

export interface ValueTypeBase {
  type: 'string' | 'boolean' | 'number' | 'object' | 'array' | 'element' | 'dataQuery';
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
  properties?: { [key: string]: PrimitiveValueType };
}

export interface ArrayValueType extends ValueTypeBase {
  type: 'array';
  items?: PrimitiveValueType;
}

export interface ElementValueType extends ValueTypeBase {
  type: 'element';
}

export interface DataQueryValueType extends ValueTypeBase {
  type: 'dataQuery';
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
    | 'dataQuery' // Remove this after we redo bindings
    | 'multiSelect' // multi select ({ type: 'array', items: { type: 'enum', values: ['1', '2', '3'] } })
    | 'date'; // date picker
}

export type PrimitiveValueType =
  | StringValueType
  | NumberValueType
  | BooleanValueType
  | ObjectValueType
  | ArrayValueType;

export type PropValueType = PrimitiveValueType | ElementValueType | DataQueryValueType;

export interface ArgTypeDefinition {
  name?: string;
  typeDef: PropValueType;
  required?: boolean;
  defaultValue?: any;
  description?: string;
  control?: ArgControlSpec;
  onChangeProp?: string;
  onChangeHandler?: OnChangeHandler;
  defaultValueProp?: string;
}

export type ArgTypeDefinitions<P = any> = {
  [K in keyof P & string]?: ArgTypeDefinition;
};

export interface ComponentDefinition<P> {
  // props: PropDefinitions<P>;
  argTypes: ArgTypeDefinitions<P>;
}

export type { PlaceholderProps, SlotsProps, StudioRuntimeNode, RuntimeError } from './runtime';
export { Placeholder, Slots, useStudioNode } from './runtime';

export type FlowDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

export { default as useDataQuery } from './useDataQuery.js';
export * from './constants.js';
