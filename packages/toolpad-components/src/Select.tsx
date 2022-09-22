import * as React from 'react';
import { TextFieldProps, MenuItem, TextField } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

export interface SelectOption {
  value: string;
  label?: string;
}

export type SelectProps = TextFieldProps & {
  options: (string | SelectOption)[];
};

const DEFAULT_OPTIONS = {
  options: ['January', 'February', 'March', 'April', 'May', 'June'],
  label: 'Months',
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
  layoutDirection: 'both',
  loadingPropSource: ['value', 'options'],
  loadingProp: 'disabled',
  argTypes: {
    options: {
      typeDef: { type: 'array', schema: '/schemas/SelectOptions.json' },
      control: { type: 'SelectOptions' },
      defaultValue: DEFAULT_OPTIONS.options,
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
      defaultValue: DEFAULT_OPTIONS.options[0],
    },
    label: {
      typeDef: { type: 'string' },
      defaultValue: DEFAULT_OPTIONS.label,
    },
    variant: {
      typeDef: { type: 'string', enum: ['outlined', 'filled', 'standard'] },
      defaultValue: 'outlined',
    },
    size: {
      typeDef: { type: 'string', enum: ['small', 'medium'] },
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
