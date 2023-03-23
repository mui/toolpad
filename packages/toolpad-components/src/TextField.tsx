import * as React from 'react';
import {
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps,
  BoxProps,
} from '@mui/material';
import { createComponent } from '@mui/toolpad-core';
import { SX_PROP } from './constants.js';

export type TextFieldProps = Omit<MuiTextFieldProps, 'value' | 'onChange'> & {
  value: string;
  onChange: (newValue: string) => void;
  alignItems?: BoxProps['alignItems'];
  justifyContent?: BoxProps['justifyContent'];
};

function TextField({ defaultValue, onChange, ...props }: TextFieldProps) {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange],
  );

  return <MuiTextField {...props} onChange={handleChange} />;
}

export default createComponent(TextField, {
  helperText: 'The TextField component lets you input a text value.',
  layoutDirection: 'both',
  argTypes: {
    value: {
      helperText: 'The value that is controlled by this text input.',
      typeDef: { type: 'string', default: '' },
      onChangeProp: 'onChange',
      defaultValueProp: 'defaultValue',
    },
    defaultValue: {
      helperText: 'A default value for when the inoput is still empty.',
      typeDef: { type: 'string', default: '' },
    },
    label: {
      helperText: 'A label that describes the content of the text field. e.g. "First name".',
      typeDef: { type: 'string' },
    },
    variant: {
      helperText:
        'One of the available MUI TextField [variants](https://mui.com/material-ui/react-button/#basic-button). Possible values are `outlined`, `filled` or `standard`',
      typeDef: { type: 'string', enum: ['outlined', 'filled', 'standard'], default: 'outlined' },
    },
    size: {
      helperText: 'The size of the input. One of `small`, or `medium`.',
      typeDef: { type: 'string', enum: ['small', 'medium'], default: 'small' },
    },
    fullWidth: {
      helperText: 'Whether the input should occupy all available horizontal space.',
      typeDef: { type: 'boolean' },
    },
    disabled: {
      helperText: 'Whether the input is disabled.',
      typeDef: { type: 'boolean' },
    },
    sx: SX_PROP,
  },
});
