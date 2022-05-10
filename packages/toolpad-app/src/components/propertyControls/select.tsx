import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import * as React from 'react';
import type { EditorProps, PropControlDefinition } from '../../types';

function SelectPropEditor({ label, argType, value, onChange, disabled }: EditorProps<string>) {
  const id = React.useId();
  const items = argType.typeDef.type === 'string' ? argType.typeDef.enum ?? [] : [];
  const handleChange = React.useCallback(
    (event: SelectChangeEvent<string>) => {
      onChange(event.target.value);
    },
    [onChange],
  );
  return (
    <FormControl fullWidth size="small">
      <InputLabel id={id}>{label}</InputLabel>
      <Select
        labelId={id}
        size="small"
        label={label}
        value={value ?? ''}
        disabled={disabled}
        onChange={handleChange}
      >
        <MenuItem value="">-</MenuItem>
        {items.map((item) => (
          <MenuItem key={item} value={item}>
            {item}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

const SelectType: PropControlDefinition<string> = {
  Editor: SelectPropEditor,
};

export default SelectType;
