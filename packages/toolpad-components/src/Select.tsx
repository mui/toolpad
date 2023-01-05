import * as React from 'react';
import { TextFieldProps, MenuItem, TextField } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';
import { SX_PROP_HELPER_TEXT } from './constants';

export interface SelectOption {
  value: string;
  label?: string;
}

export type SelectProps = TextFieldProps & {
  options: (string | SelectOption)[];
};

function Select({ options, value, defaultValue, fullWidth, sx, ...rest }: SelectProps) {
  return (
    <TextField
      select
      sx={{ ...(!fullWidth && !value ? { width: 120 } : {}), ...sx }}
      fullWidth={fullWidth}
      value={value}
      {...rest}
    >
      {options.map((option) => {
        const parsedOption: SelectOption = typeof option === 'string' ? { value: option } : option;
        return (
          <MenuItem key={parsedOption.value} value={parsedOption.value}>
            {parsedOption.label ?? parsedOption.value}
          </MenuItem>
        );
      })}
    </TextField>
  );
}

export default createComponent(Select, {
  helperText: 'The Select component lets you select a value from a set of options.',
  layoutDirection: 'both',
  loadingPropSource: ['value', 'options'],
  loadingProp: 'disabled',
  argTypes: {
    options: {
      typeDef: { type: 'array', schema: '/schemas/SelectOptions.json' },
      control: { type: 'SelectOptions' },
      defaultValue: [],
    },
    value: {
      typeDef: { type: 'string' },
      onChangeProp: 'onChange',
      onChangeHandler: (event: React.ChangeEvent<HTMLSelectElement>) => event.target.value,
      defaultValue: '',
      defaultValueProp: 'defaultValue',
    },
    defaultValue: {
      typeDef: { type: 'string' },
      defaultValue: '',
    },
    label: {
      typeDef: { type: 'string' },
      defaultValue: '',
    },
    variant: {
      typeDef: { type: 'string', enum: ['outlined', 'filled', 'standard'] },
      defaultValue: 'outlined',
    },
    size: {
      helperText: 'The size of the component. One of `small`, `medium`, or `large`.',
      typeDef: { type: 'string', enum: ['small', 'medium'] },
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
