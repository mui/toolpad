import type { StudioComponentDefinition, StudioComponentDefinitions } from '../types';

import Page from './Page';
import Text from './Text';
import TextField from './TextField';
import Button from './Button';
import Paper from './Paper';
import Stack from './Stack';
import DataGrid from './DataGrid';

const components = new Map([
  ['@mui/studio-components', 'Button'],
  ['@mui/studio-components', 'DataGrid'],
  ['@mui/studio-components', 'Page'],
  ['@mui/studio-components', 'Paper'],
  ['@mui/studio-components', 'Stack'],
  ['@mui/studio-components', 'Text'],
  ['@mui/studio-components', 'TextField'],
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
  const component = studioComponents[componentName];
  if (!component) {
    throw new Error(`Invariant: Accessing unknown component "${componentName}"`);
  }
  return component;
}
