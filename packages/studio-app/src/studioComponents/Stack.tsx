import { StudioComponentDefinition } from './studioComponentDefinition';
import importedComponentRenderer from './importedComponentRenderer';

export default {
  id: 'Stack',
  displayName: 'Stack',
  render: importedComponentRenderer('@mui/material', 'Stack'),
  argTypes: {
    gap: {
      typeDef: { type: 'number' },
      defaultValue: 2,
    },
    margin: {
      typeDef: { type: 'number' },
    },
    direction: {
      typeDef: {
        type: 'string',
        enum: ['row', 'row-reverse', 'column', 'column-reverse'],
      },
      defaultValue: 'row',
    },
    alignItems: {
      typeDef: {
        type: 'string',
        enum: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'],
      },
      defaultValue: 'center',
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slots' },
    },
  },
} as StudioComponentDefinition;
