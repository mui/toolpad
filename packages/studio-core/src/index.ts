import * as React from 'react';

export interface StudioConfiguration {
  dir: string;
}

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
  (Component as any)._studioDefinition = definition;
  return Component;
}
