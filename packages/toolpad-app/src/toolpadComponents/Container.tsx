import { Container } from '@mui/material';
import importedComponentRenderer from './importedComponentRenderer';
import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'Container',
  displayName: 'Container',
  render: importedComponentRenderer('@mui/material', 'Container'),
  Component: Container,
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
