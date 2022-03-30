import * as React from 'react';
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  MenuItem,
} from '@mui/material';

export interface Selectoption {
  value: string;
  label: string;
}

export interface SelectProps extends MuiSelectProps {
  options: Selectoption[];
}

export default function Select({ sx, label, options, ...props }: SelectProps) {
  // TODO: generate a unique id
  //       https://github.com/reactwg/react-18/discussions/111
  const labelId = 'my-select';
  return (
    <FormControl size="small" sx={sx}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <MuiSelect labelId={labelId} label={label} {...props}>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label ?? option.value}
          </MenuItem>
        )) ?? null}
      </MuiSelect>
    </FormControl>
  );
}
