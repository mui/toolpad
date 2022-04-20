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
    };

export interface ComponentConfig<P> {
  argTypes: ArgTypeDefinitions<P>;
}

export type LiveBindings = Partial<Record<string, LiveBinding>>;

let iframe: HTMLIFrameElement;
export function evalCode(code: string, globalScope: Record<string, unknown>) {
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
    iframe.style.display = 'none';
    document.documentElement.appendChild(iframe);
  }

  // eslint-disable-next-line no-underscore-dangle
  (iframe.contentWindow as any).__SCOPE = globalScope;
  return (iframe.contentWindow as any).eval(`with (window.__SCOPE) { ${code} }`);
}

export type { PlaceholderProps, SlotsProps, NodeRuntime, RuntimeError } from './runtime';
export { Placeholder, Slots, useNode } from './runtime';

export type FlowDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

export type { UseDataQuery } from './useDataQuery.js';
export * from './useDataQuery.js';

export { default as useUrlQueryState } from './useUrlQueryState.js';

export * from './constants.js';
