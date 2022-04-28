import { Typography } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';
import withDefaultProps from './utils/addDefaultProps';

export default createComponent(
  withDefaultProps(Typography, {
    children: 'Text',
  }),
  {
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
  },
);
