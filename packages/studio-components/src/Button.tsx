import { Button } from '@mui/material';
import { createComponent } from '@mui/studio-core';

export default createComponent(Button, {
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
  },
});
