import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import * as React from 'react';
import { EditorProps } from '../types';

export function createSelectEditor<T extends string = string>(items: T[]) {
  return function ListPropEditor({ name, value, onChange, disabled }: EditorProps<T>) {
    const handleChange = React.useCallback(
      (event: SelectChangeEvent<string>) => {
        onChange(event.target.value as T);
      },
      [onChange],
    );
    return (
      <FormControl fullWidth size="small">
        <InputLabel id={`select-${name}`}>{name}</InputLabel>
        <Select
          labelId={`select-${name}`}
          size="small"
          label={name}
          value={value}
          disabled={disabled}
          onChange={handleChange}
        >
          {items.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };
}
