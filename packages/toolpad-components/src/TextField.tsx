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
    value: {
      typeDef: { type: 'string' },
      onChangeProp: 'onChange',
      onChangeHandler: (event: React.ChangeEvent<HTMLInputElement>) => event.target.value,
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
      typeDef: { type: 'string', enum: ['small', 'normal'] },
      defaultValue: 'small',
    },
    fullWidth: {
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
