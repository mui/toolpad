import * as React from 'react';
import { LoadingButton as MuiButton, LoadingButtonProps as MuiButtonProps } from '@mui/lab';
import { createComponent } from '@mui/toolpad-core';

interface ButtonProps extends Omit<MuiButtonProps, 'children'> {
  content: string;
}

function Button({ content, ...rest }: ButtonProps) {
  return <MuiButton {...rest}>{content}</MuiButton>;
}

export default createComponent(Button, {
  hasBoxAlign: true,
  hasBoxJustify: true,
  argTypes: {
    content: {
      typeDef: { type: 'string' },
      defaultValue: 'Button Text',
    },
    onClick: {
      typeDef: { type: 'event' },
    },
    variant: {
      typeDef: { type: 'string', enum: ['contained', 'outlined', 'text'] },
      defaultValue: 'contained',
    },
    disabled: {
      typeDef: { type: 'boolean' },
    },
    fullWidth: {
      typeDef: { type: 'boolean' },
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
