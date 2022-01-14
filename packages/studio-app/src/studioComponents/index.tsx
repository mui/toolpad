import * as studioComponentLib from '@mui/studio-components';
import { ArgTypeDefinitions, DEFINITION_KEY, StudioComponent } from '@mui/studio-core';
import * as studioDom from '../studioDom';

export interface StudioComponentDefinition {
  argTypes: ArgTypeDefinitions;
  module: string;
  importedName: string;
}

export const DEFAULT_COMPONENTS = new Map([
  ['Button', { module: '@mui/studio-components', importedName: 'Button' }],
  ['DataGrid', { module: '@mui/studio-components', importedName: 'DataGrid' }],
  ['Paper', { module: '@mui/studio-components', importedName: 'Paper' }],
  ['Stack', { module: '@mui/studio-components', importedName: 'Stack' }],
  ['TextField', { module: '@mui/studio-components', importedName: 'TextField' }],
  ['Typography', { module: '@mui/studio-components', importedName: 'Typography' }],
  ['CustomLayout', { module: '@mui/studio-components', importedName: 'CustomLayout' }],
]);

export function getStudioComponent(
  // TODO: remove this comment when custom components are implemented
  // dom is unused yet, but added as a paramater because that is where we will store
  // custom components or imported components for an application.
  // The parameter serves as a constraint on all callsites that this is a use case
  // that we need to keep in mind.
  dom: studioDom.StudioDom,
  componentName: string,
): StudioComponentDefinition {
  const component = DEFAULT_COMPONENTS.get(componentName);
  if (!component) {
    throw new Error(`Invariant: Accessing unknown component "${componentName}"`);
  }

  const componentLibImport: StudioComponent<any> | undefined =
    studioComponentLib[componentName as keyof typeof studioComponentLib];

  if (!componentLibImport) {
    throw new Error(`Component "${componentName}" is not exported from '@mui/studio-components'`);
  }

  return {
    ...component,
    argTypes: (componentLibImport as any)[DEFINITION_KEY]?.argTypes || {},
  };
}
