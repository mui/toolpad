import * as React from 'react';
import { LoadingButton as MuiButton, LoadingButtonProps as MuiButtonProps } from '@mui/lab';
import { createComponent } from '@mui/toolpad-core';

interface ButtonProps extends Omit<MuiButtonProps, 'children'> {
  content: string;
}

function Button({ content, ...props }: ButtonProps) {
  return <MuiButton {...props}>{content}</MuiButton>;
}

Button.defaultProps = {
  content: 'Button Text',
  variant: 'contained',
  color: 'primary',
} as ButtonProps;

export default createComponent(Button, {
  argTypes: {
    content: {
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
    loading: {
      typeDef: { type: 'boolean' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
});
