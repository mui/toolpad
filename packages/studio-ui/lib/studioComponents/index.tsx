import * as studioComponentLib from '@mui/studio-components';
import type { StudioComponentDefinition, StudioComponentDefinitions } from '../types';

import Page from './Page';
import Text from './Text';
import TextField from './TextField';
import Button from './Button';
import Paper from './Paper';
import Stack from './Stack';
import DataGrid from './DataGrid';

const components = new Map([
  ['Button', { module: '@mui/studio-components', importedName: 'Button' }],
  ['DataGrid', { module: '@mui/studio-components', importedName: 'DataGrid' }],
  ['Page', { module: '@mui/studio-components', importedName: 'Page' }],
  ['Paper', { module: '@mui/studio-components', importedName: 'Paper' }],
  ['Stack', { module: '@mui/studio-components', importedName: 'Stack' }],
  ['Text', { module: '@mui/studio-components', importedName: 'Text' }],
  ['TextField', { module: '@mui/studio-components', importedName: 'TextField' }],
]);

const studioComponents: StudioComponentDefinitions = {
  Page,
  TextField,
  Text,
  Button,
  Stack,
  Paper,
  DataGrid,
};

export default studioComponents;

export type ComponentName = keyof typeof studioComponents;

export function getStudioComponent(componentName: string): StudioComponentDefinition {
  const component = components.get(componentName);
  if (!component) {
    throw new Error(`Invariant: Accessing unknown component "${componentName}"`);
  }
  return {
    ...component,
    props: (studioComponentLib as any)[componentName].studioDefinition.props,
  };
}
