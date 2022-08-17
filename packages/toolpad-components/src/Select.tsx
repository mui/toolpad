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

function Select({ sx, options, ...rest }: SelectProps) {
  return (
    <TextField select sx={{ minWidth: 120, ...sx }} {...rest}>
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
    label: {
      typeDef: { type: 'string' },
      defaultValue: '',
    },
    disabled: {
      typeDef: { type: 'boolean' },
    },
    variant: {
      typeDef: { type: 'string', enum: ['outlined', 'filled', 'standard'] },
      defaultValue: 'outlined',
    },
    fullWidth: {
      typeDef: { type: 'boolean' },
    },
    size: {
      typeDef: { type: 'string', enum: ['small', 'medium'] },
      defaultValue: 'small',
    },
    value: {
      typeDef: { type: 'string' },
      onChangeProp: 'onChange',
      onChangeHandler: (event: React.ChangeEvent<HTMLSelectElement>) => event.target.value,
      defaultValue: '',
    },
    options: {
      typeDef: { type: 'array', schema: '/schemas/SelectOptions.json' },
      control: { type: 'SelectOptions' },
      defaultValue: [],
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
});
