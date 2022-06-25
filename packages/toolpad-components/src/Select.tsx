import * as React from 'react';
import { TextFieldProps, MenuItem, TextField, Box } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

export interface Selectoption {
  value: string;
  label?: string;
}

export type SelectProps = TextFieldProps & {
  options: (string | Selectoption)[];
};

function Select({ sx, options, ...props }: SelectProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <TextField select sx={{ minWidth: 120, ...sx }} {...props}>
        {options.map((option) => {
          const parsedOption: Selectoption =
            typeof option === 'string' ? { value: option } : option;
          return (
            <MenuItem key={parsedOption.value} value={parsedOption.value}>
              {parsedOption.label ?? parsedOption.value}
            </MenuItem>
          );
        })}
      </TextField>
    </Box>
  );
}

export default createComponent(Select, {
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
