import { TOOLPAD_COMPONENT } from './constants.js';
import { ComponentConfig, ToolpadComponent } from './types';

export type { NodeRuntime } from './runtime';
export { useNode } from './runtime';

export type FlowDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

export type { UseDataQuery } from './useDataQuery.js';
export * from './useDataQuery.js';

export { default as useUrlQueryState } from './useUrlQueryState.js';

export * from './constants.js';

export function createComponent<P>(
  Component: React.ComponentType<P>,
  config?: ComponentConfig<P>,
): ToolpadComponent<P> {
  return Object.assign(Component, {
    [TOOLPAD_COMPONENT]: config || { argTypes: {} },
  });
}

export * from './types';
