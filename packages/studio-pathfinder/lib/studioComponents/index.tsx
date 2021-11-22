import {
  StudioComponentDefinition,
  StudioComponentDefinitions,
  StudioComponentProps,
} from '../types';

import { ExactEntriesOf } from '../utils/types';
import Page from './Page';
import GridRow from './GridRow';
import Text from './Text';
import TextField from './TextField';
import Button from './Button';
import Paper from './Paper';
import Stack from './Stack';
import DataGrid from './DataGrid';

export function getDefaultPropValues<P = {}>(definition: StudioComponentDefinition<P>): Partial<P> {
  return Object.fromEntries(
    (Object.entries(definition.props) as ExactEntriesOf<StudioComponentProps<P>>).map(
      ([name, prop]) => [name, prop.defaultValue],
    ),
  ) as Partial<P>;
}

const studioComponents: StudioComponentDefinitions = {
  Page,
  GridRow,
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
