import { Typography } from '@mui/material';
import { ToolpadComponentDefinition } from './componentDefinition';
import importedComponentRenderer from './importedComponentRenderer';
import addDefaultProps from './addDefaultProps';

export default {
  id: 'Typography',
  displayName: 'Typography',
  render: importedComponentRenderer('@mui/material', 'Typography'),
  Component: addDefaultProps(Typography, { children: 'Text' }),
  argTypes: {
    children: {
      typeDef: { type: 'string' },
      label: 'value',
      defaultValue: 'Text',
    },
    variant: {
      typeDef: {
        type: 'string',
        enum: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2'],
      },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
} as ToolpadComponentDefinition;
