import * as React from 'react';
import {
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps,
  BoxProps,
} from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

export type TextFieldProps = MuiTextFieldProps & {
  alignItems?: BoxProps['alignItems'];
  justifyContent?: BoxProps['justifyContent'];
};

function TextField(props: TextFieldProps) {
  return <MuiTextField {...props} />;
}

export default createComponent(TextField, {
  layoutDirection: 'both',
  argTypes: {
    label: {
      typeDef: { type: 'string' },
    },
    variant: {
      typeDef: { type: 'string', enum: ['outlined', 'filled', 'standard'] },
      defaultValue: 'outlined',
    },
    disabled: {
      typeDef: { type: 'boolean' },
    },
    fullWidth: {
      typeDef: { type: 'boolean' },
    },
    size: {
      typeDef: { type: 'string', enum: ['small', 'normal'] },
      defaultValue: 'small',
    },
    value: {
      typeDef: { type: 'string' },
      onChangeProp: 'onChange',
      onChangeHandler: (event: React.ChangeEvent<HTMLInputElement>) => event.target.value,
      defaultValue: '',
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
});
