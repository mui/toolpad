import importedComponentRenderer from './importedComponentRenderer';
import { StudioComponentDefinition } from './studioComponentDefinition';

export default {
  id: 'Container',
  displayName: 'Container',
  render: importedComponentRenderer('@mui/material', 'Container'),
  argTypes: {
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slot' },
    },
  },
} as StudioComponentDefinition;
