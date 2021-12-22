import * as React from 'react';
import { DATA_PROP_SLOT, DATA_PROP_SLOT_DIRECTION, DEFINITION_KEY } from './constants';

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

export function Placeholder() {
  return (
    <div
      style={{
        display: 'block',
        minHeight: 40,
        minWidth: 200,
      }}
      {...{
        [DATA_PROP_SLOT]: 'slot',
      }}
    />
  );
}

export type FlowDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

export interface SlotsProps {
  direction: FlowDirection;
  children: React.ReactNode;
}

export function Slots({ children, direction }: SlotsProps) {
  const count = React.Children.count(children);
  const dataProps: Record<string, string> = {
    [DATA_PROP_SLOT_DIRECTION]: direction,
    [DATA_PROP_SLOT]: 'slots',
  };
  return count > 0 ? (
    <div style={{ display: 'contents' }} {...dataProps}>
      {children}
    </div>
  ) : (
    <Placeholder />
  );
}

export interface SlotProps {
  name: string;
  children?: React.ReactNode;
}

export function Slot({ children }: SlotProps) {
  const count = React.Children.count(children);
  return count > 0 ? <React.Fragment>{children}</React.Fragment> : <Placeholder />;
}

export { default as useDataQuery } from './useDataQuery';
export * from './constants';
