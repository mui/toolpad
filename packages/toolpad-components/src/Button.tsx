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
  helperText: 'The standard MUI [Button component](https://mui.com/material-ui/react-button/)',

  layoutDirection: 'both',
  argTypes: {
    onClick: {
      typeDef: { type: 'event' },
    },
    content: {
      helperText: 'Will appear as the text content of the button.',
      typeDef: { type: 'string' },
      defaultValue: 'Button Text',
    },
    variant: {
      helperText:
        'One of the available [MUI variants](https://mui.com/material-ui/react-button/#basic-button).',
      typeDef: { type: 'string', enum: ['contained', 'outlined', 'text'] },
      defaultValue: 'contained',
    },
    size: {
      typeDef: { type: 'string', enum: ['small', 'medium', 'large'] },
    },
    color: {
      typeDef: { type: 'string', enum: ['primary', 'secondary'] },
      defaultValue: 'primary',
    },
    fullWidth: {
      typeDef: { type: 'boolean' },
    },
    loading: {
      typeDef: { type: 'boolean' },
    },
    disabled: {
      typeDef: { type: 'boolean' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
});
