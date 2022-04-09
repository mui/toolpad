import { Typography } from '@mui/toolpad-components';
import { ToolpadComponentDefinition } from './componentDefinition';

export default {
  id: 'Typography',
  displayName: 'Typography',
  Component: Typography,
  importedModule: '@mui/toolpad-components',
  importedName: 'Typography',
  argTypes: {
    children: {
      typeDef: { type: 'string' },
      label: 'value',
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
