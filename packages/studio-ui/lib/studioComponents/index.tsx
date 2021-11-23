import type { StudioComponentDefinition, StudioComponentDefinitions } from '../types';

import Page from './Page';
import Text from './Text';
import TextField from './TextField';
import Button from './Button';
import Paper from './Paper';
import Stack from './Stack';
import DataGrid from './DataGrid';

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
