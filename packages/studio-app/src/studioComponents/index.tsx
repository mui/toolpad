import * as studioComponentLib from '@mui/studio-components';
import { DEFINITION_KEY } from '@mui/studio-core';
import * as studioDom from '../studioDom';

export interface StudioComponentDefinition {
  props: any;
  module: string;
  importedName: string;
}

export const DEFAULT_COMPONENTS = new Map([
  ['Button', { module: '@mui/studio-components', importedName: 'Button' }],
  ['DataGrid', { module: '@mui/studio-components', importedName: 'DataGrid' }],
  ['Page', { module: '@mui/studio-components', importedName: 'Page' }],
  ['Paper', { module: '@mui/studio-components', importedName: 'Paper' }],
  ['Stack', { module: '@mui/studio-components', importedName: 'Stack' }],
  ['Text', { module: '@mui/studio-components', importedName: 'Text' }],
  ['TextField', { module: '@mui/studio-components', importedName: 'TextField' }],
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
    props: (studioComponentLib as any)[componentName][DEFINITION_KEY].props,
  };
}
