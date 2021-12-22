import * as studioComponentLib from '@mui/studio-components';
import { DEFINITION_KEY } from '@mui/studio-core';
import type { StudioComponentDefinition } from '../types';

export const components = new Map([
  ['Button', { module: '@mui/studio-components', importedName: 'Button' }],
  ['DataGrid', { module: '@mui/studio-components', importedName: 'DataGrid' }],
  ['Page', { module: '@mui/studio-components', importedName: 'Page' }],
  ['Paper', { module: '@mui/studio-components', importedName: 'Paper' }],
  ['Stack', { module: '@mui/studio-components', importedName: 'Stack' }],
  ['Text', { module: '@mui/studio-components', importedName: 'Text' }],
  ['TextField', { module: '@mui/studio-components', importedName: 'TextField' }],
]);

export function getStudioComponent(componentName: string): StudioComponentDefinition {
  const component = components.get(componentName);
  if (!component) {
    throw new Error(`Invariant: Accessing unknown component "${componentName}"`);
  }
  return {
    ...component,
    props: (studioComponentLib as any)[componentName][DEFINITION_KEY].props,
  };
}
