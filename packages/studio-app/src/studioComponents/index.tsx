import * as studioComponentLib from '@mui/studio-components';
import { ArgTypeDefinitions, DEFINITION_KEY } from '@mui/studio-core';
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
]);

export function getStudioComponent(
  // TODO: remove this comment when custon components are implemented
  // dom is unused yet, but added as a paramater because that is where we will store
  // custom components or imported components for an application.
  // The parameter serves as a constraint on all callsites that this is a use case
  // that we nbeed to keep in mind.
  dom: studioDom.StudioDom,
  componentName: string,
): StudioComponentDefinition {
  const component = DEFAULT_COMPONENTS.get(componentName);
  if (!component) {
    throw new Error(`Invariant: Accessing unknown component "${componentName}"`);
  }
  return {
    ...component,
    argTypes: (studioComponentLib as any)[componentName][DEFINITION_KEY].argTypes,
  };
}
