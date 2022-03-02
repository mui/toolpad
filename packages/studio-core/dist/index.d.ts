/// <reference types="react" />
export declare type SlotType = 'single' | 'multiple';
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
    type: 'boolean' | 'number' | 'range' | 'object' | 'radio' | 'buttons' | 'select' | 'string' | 'color' | 'slot' | 'slots' | 'multiSelect' | 'date' | 'json' | 'GridColumns';
}
declare type PrimitiveValueType = StringValueType | NumberValueType | BooleanValueType | ObjectValueType | ArrayValueType;
export declare type PropValueType = PrimitiveValueType | ElementValueType;
export declare type PropValueTypes<K extends string = string> = Partial<{
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
export declare type ArgTypeDefinitions<P = any> = {
    [K in keyof P & string]?: ArgTypeDefinition;
};
export interface ComponentDefinition<P> {
    argTypes: ArgTypeDefinitions<P>;
}
export interface LiveBinding {
    value?: any;
    error?: Error;
}
export declare type RuntimeEvent = {
    type: 'propUpdated';
    nodeId: string;
    prop: string;
    value: React.SetStateAction<unknown>;
};
export interface ComponentConfig<P> {
    argTypes: ArgTypeDefinitions<P>;
}
export declare type LiveBindings = Partial<Record<string, LiveBinding>>;
export type { PlaceholderProps, SlotsProps, StudioRuntimeNode, RuntimeError } from './runtime';
export { Placeholder, Slots, useStudioNode } from './runtime';
export declare type FlowDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type { UseDataQuery } from './useDataQuery.js';
export * from './useDataQuery.js';
export { default as useUrlQueryState } from './useUrlQueryState.js';
export * from './constants.js';
