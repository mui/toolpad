import { Container } from '@mui/toolpad-components';
import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'Container',
  displayName: 'Container',
  Component: Container,
  importedModule: '@mui/toolpad-components',
  importedName: 'Container',
  argTypes: {
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slot' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
} as ToolpadComponentDefinition;
