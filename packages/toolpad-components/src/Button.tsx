import * as React from 'react';
import { LoadingButton as MuiButton, LoadingButtonProps as MuiButtonProps } from '@mui/lab';
import { createComponent } from '@mui/toolpad-core';
import { Box } from '@mui/material';

interface ButtonProps extends Omit<MuiButtonProps, 'children'> {
  content: string;
}

function Button({ content, ...props }: ButtonProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <MuiButton {...props}>{content}</MuiButton>
    </Box>
  );
}

export default createComponent(Button, {
  argTypes: {
    content: {
      typeDef: { type: 'string' },
      defaultValue: 'Button Text',
    },
    onClick: {
      typeDef: { type: 'function' },
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
