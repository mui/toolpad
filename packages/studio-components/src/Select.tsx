import { Select, SelectProps, MenuItem, FormControl, InputLabel } from '@mui/material';
import { createComponent } from '@mui/studio-core';
import React from 'react';

export interface SelectComponentProps extends SelectProps {
  options?: string;
}

function SelectComponent({ label, value, options = '', ...props }: SelectComponentProps) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel id={`select-data-query`}>{label}</InputLabel>
      <Select value={value || ''} labelId="select-data-query" label={label} {...props}>
        {options.split(',').map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default createComponent(SelectComponent, {
  argTypes: {
    label: {
      typeDef: { type: 'string' },
      defaultValue: '',
    },
    variant: {
      typeDef: { type: 'string', enum: ['outlined', 'filled', 'standard'] },
      defaultValue: 'outlined',
    },
    size: {
      typeDef: { type: 'string', enum: ['small', 'normal'] },
      defaultValue: 'small',
    },
    value: {
      typeDef: { type: 'string' },
      onChangeProp: 'onChange',
      onChangeHandler: {
        params: ['event'],
        valueGetter: 'event.target.value',
      },
    },
    options: {
      typeDef: { type: 'string' },
      // TODO: make this:
      // typeDef: { type: 'array', items: { type: 'string' } },
    },
  },
});
