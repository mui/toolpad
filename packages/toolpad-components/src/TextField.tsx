import * as React from 'react';
import {
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps,
  BoxProps,
} from '@mui/material';
import { createComponent } from '@mui/toolpad-core';
import { SX_PROP_HELPER_TEXT } from './constants';

export type TextFieldProps = MuiTextFieldProps & {
  alignItems?: BoxProps['alignItems'];
  justifyContent?: BoxProps['justifyContent'];
};

function TextField({ defaultValue, ...props }: TextFieldProps) {
  return <MuiTextField {...props} />;
}

export default createComponent(TextField, {
  helperText: 'The TextField component lets you input a text value.',
  layoutDirection: 'both',
  argTypes: {
    value: {
      typeDef: { type: 'string' },
      onChangeProp: 'onChange',
      onChangeHandler: (event: React.ChangeEvent<HTMLInputElement>) => event.target.value,
      defaultValue: '',
      defaultValueProp: 'defaultValue',
    },
    defaultValue: {
      typeDef: { type: 'string' },
      defaultValue: '',
    },
    label: {
      typeDef: { type: 'string' },
    },
    variant: {
      typeDef: { type: 'string', enum: ['outlined', 'filled', 'standard'] },
      defaultValue: 'outlined',
    },
    size: {
      helperText: 'The size of the component. One of `small`, `medium`, or `large`.',
      typeDef: { type: 'string', enum: ['small', 'normal'] },
      defaultValue: 'small',
    },
    fullWidth: {
      helperText: 'Whether the button should occupy all available horizontal space.',
      typeDef: { type: 'boolean' },
    },
    disabled: {
      typeDef: { type: 'boolean' },
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      typeDef: { type: 'object' },
    },
  },
});
