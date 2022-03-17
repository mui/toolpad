import importedComponentRenderer from './importedComponentRenderer';
import { StudioComponentDefinition } from './studioComponentDefinition';

export default {
  id: 'Button',
  displayName: 'Button',
  render: importedComponentRenderer('@mui/material', 'Button'),
  argTypes: {
    children: {
      name: 'content',
      typeDef: { type: 'string' },
      defaultValue: 'Button Text',
    },
    disabled: {
      typeDef: { type: 'boolean' },
    },
    variant: {
      typeDef: { type: 'string', enum: ['contained', 'outlined', 'text'] },
      defaultValue: 'contained',
    },
    color: {
      typeDef: { type: 'string', enum: ['primary', 'secondary'] },
      defaultValue: 'primary',
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
} as StudioComponentDefinition;
