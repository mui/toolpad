import * as React from 'react';
import { LoadingButton as MuiButton, LoadingButtonProps as MuiButtonProps } from '@mui/lab';
import { createComponent } from '@mui/toolpad-core';
import { SX_PROP_HELPER_TEXT } from './constants';

interface ButtonProps extends Omit<MuiButtonProps, 'children'> {
  content: string;
}

function Button({ content, ...rest }: ButtonProps) {
  return <MuiButton {...rest}>{content}</MuiButton>;
}

export default createComponent(Button, {
  helperText:
    'The MUI [Button](https://mui.com/material-ui/react-button/) component.\n\nButtons allow users to take actions, and make choices, with a single tap.',
  layoutDirection: 'both',
  argTypes: {
    onClick: {
      helperText: 'Add logic to be executed when the user clicks the button.',
      typeDef: { type: 'event' },
    },
    content: {
      helperText: 'Will appear as the text content of the button.',
      typeDef: { type: 'string' },
      defaultValue: 'Button Text',
    },
    variant: {
      helperText:
        'One of the available MUI Button [variants](https://mui.com/material-ui/react-button/#basic-button). Possible values are `contained`, `outlined` or `text`',
      typeDef: { type: 'string', enum: ['contained', 'outlined', 'text'] },
      defaultValue: 'contained',
    },
    size: {
      helperText: 'The size of the component. One of `small`, `medium`, or `large`.',
      typeDef: { type: 'string', enum: ['small', 'medium', 'large'] },
    },
    color: {
      helperText: 'The theme color of the component.',
      typeDef: { type: 'string', enum: ['primary', 'secondary'] },
      defaultValue: 'primary',
    },
    fullWidth: {
      helperText: 'Whether the button should occupy all available horizontal space.',
      typeDef: { type: 'boolean' },
    },
    loading: {
      helperText: "Displays a loading animation indicating the button isn't interactive yet",
      typeDef: { type: 'boolean' },
    },
    disabled: {
      helperText: 'Whether the button is disabled.',
      typeDef: { type: 'boolean' },
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      typeDef: { type: 'object' },
    },
  },
});
