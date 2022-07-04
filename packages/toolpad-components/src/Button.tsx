import * as React from 'react';
import { LoadingButton as MuiButton, LoadingButtonProps as MuiButtonProps } from '@mui/lab';
import { createComponent } from '@mui/toolpad-core';

interface ButtonProps extends Omit<MuiButtonProps, 'children'> {
  content: string;
}

function Button({ content, ...props }: ButtonProps) {
  return <MuiButton {...props}>{content}</MuiButton>;
}

export default createComponent(Button, {
  argTypes: {
    content: {
      typeDef: { type: 'string' },
      defaultValue: 'Button Text',
    },
    onClick: {
      typeDef: { type: 'event' },
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
    loading: {
      typeDef: { type: 'boolean' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
});
