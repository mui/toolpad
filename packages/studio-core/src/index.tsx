import * as React from 'react';

export interface PropDefinition<K extends keyof P, P = {}> {
  defaultValue: P[K];
  type: string;
}

export type PropDefinitions<P = {}> = {
  [K in keyof P]?: PropDefinition<K, P>;
};

export interface ComponenentDefinition<P> {
  props: PropDefinitions<P>;
}

export function createComponent<P = {}>(
  Component: React.FC<P>,
  definition: ComponenentDefinition<P>,
) {
  (Component as any).studioDefinition = definition;
  return Component;
}

export const DATA_PROP_SLOT = `data-studio-slot`;
export const DATA_PROP_SLOT_DIRECTION = `data-studio-slot-direction`;

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
export { PageContext } from './PageContext';
export { EditorContext } from './EditorContext';
