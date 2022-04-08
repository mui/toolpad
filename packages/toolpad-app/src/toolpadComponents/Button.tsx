import { Button } from '@mui/material';
import importedComponentRenderer from './importedComponentRenderer';
import { ToolpadComponentDefinition } from './componentDefinition';
import addDefaultProps from './addDefaultProps';

export default {
  id: 'Button',
  displayName: 'Button',
  render: importedComponentRenderer('@mui/material', 'Button'),
  Component: addDefaultProps(Button, {
    children: 'Button Text',
    variant: 'contained',
    color: 'primary',
  }),
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
} as ToolpadComponentDefinition;
