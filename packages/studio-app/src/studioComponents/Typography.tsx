import { StudioComponentDefinition } from './studioComponentDefinition';
import importedComponentRenderer from './importedComponentRenderer';

export default {
  id: 'Typography',
  displayName: 'Typography',
  render: importedComponentRenderer('@mui/material', 'Typography'),
  argTypes: {
    children: {
      typeDef: { type: 'string' },
      defaultValue: 'Text',
    },
    variant: {
      typeDef: {
        type: 'string',
        enum: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2'],
      },
    },
  },
} as StudioComponentDefinition;
