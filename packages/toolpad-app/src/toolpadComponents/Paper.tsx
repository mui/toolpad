import { Paper } from '@mui/material';
import { ToolpadComponentDefinition } from './componentDefinition';
import importedComponentRenderer from './importedComponentRenderer';
import wrapWithDefaultProps from './WrapWithDefaultProps';

export default {
  id: 'Paper',
  displayName: 'Paper',
  render: importedComponentRenderer('@mui/material', 'Paper'),
  Component: wrapWithDefaultProps(Paper, { elevation: 1 }),
  argTypes: {
    elevation: {
      typeDef: { type: 'number', minimum: 0 },
      defaultValue: 1,
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slot' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
} as ToolpadComponentDefinition;
