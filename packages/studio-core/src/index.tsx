import * as React from 'react';
import { DEFINITION_KEY } from './constants.js';

export type SlotType = 'single' | 'multiple';

export interface OnChangeHandler {
  params: ['event'];
  valueGetter: 'event.target.value';
}

export interface PropDefinition<K extends keyof P, P = {}> {
  defaultValue: P[K];
  type: string;
  onChangeProp?: string;
  onChangeHandler?: OnChangeHandler;
}

export type PropDefinitions<P = {}> = {
  [K in keyof P & string]?: PropDefinition<K, P>;
};

export interface ComponentDefinition<P> {
  props: PropDefinitions<P>;
}

export type StudioComponent<P> =
  | React.FunctionComponent<P>
  | (React.ComponentClass<P> & {
      [DEFINITION_KEY]: ComponentDefinition<P>;
    });

export function createComponent<P = {}>(
  Component: React.FunctionComponent<P> | React.ComponentClass<P>,
  definition: ComponentDefinition<P>,
): StudioComponent<P> {
  return Object.assign(Component, {
    [DEFINITION_KEY]: definition,
  });
}

export type FlowDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

export { default as useDataQuery } from './useDataQuery.js';
export * from './constants.js';
