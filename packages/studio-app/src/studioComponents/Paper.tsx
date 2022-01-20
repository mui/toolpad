import { StudioComponentDefinition } from '../types';
import importedComponentRenderer from './importedComponentRenderer';

export default {
  id: 'Paper',
  displayName: 'Paper',
  render: importedComponentRenderer('@mui/material', 'Paper'),
  argTypes: {
    elevation: {
      typeDef: { type: 'number', minimum: 0 },
      defaultValue: 1,
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slot' },
    },
  },
} as StudioComponentDefinition;
