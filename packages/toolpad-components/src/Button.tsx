import { Button } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';
import withDefaultProps from './utils/addDefaultProps';

export default createComponent(
  withDefaultProps(Button, {
    children: 'Button Text',
    variant: 'contained',
    color: 'primary',
  }),
  {
    argTypes: {
      children: {
        label: 'content',
        typeDef: { type: 'string' },
      },
      onClick: {
        typeDef: { type: 'function' },
      },
      disabled: {
        typeDef: { type: 'boolean' },
      },
      variant: {
        typeDef: { type: 'string', enum: ['contained', 'outlined', 'text'] },
      },
      color: {
        typeDef: { type: 'string', enum: ['primary', 'secondary'] },
      },
      sx: {
        typeDef: { type: 'object' },
      },
    },
  },
);
