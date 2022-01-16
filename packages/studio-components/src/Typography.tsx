import { createComponent } from '@mui/studio-core';
import { Typography } from '@mui/material';

export default createComponent(Typography, {
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
});
