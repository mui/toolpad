import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import * as React from 'react';
import type { EditorProps, PropControlDefinition } from '../../types';

function SelectPropEditor({
  propName,
  label,
  argType,
  value,
  onChange,
  disabled,
}: EditorProps<string>) {
  const items = argType.typeDef.type === 'string' ? argType.typeDef.enum ?? [] : [];
  const handleChange = React.useCallback(
    (event: SelectChangeEvent<string>) => {
      onChange(event.target.value as string);
    },
    [onChange],
  );
  return (
    <FormControl fullWidth size="small">
      <InputLabel id={`select-${propName}`}>{label}</InputLabel>
      <Select
        labelId={`select-${propName}`}
        size="small"
        label={label}
        value={value ?? ''}
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
}

const SelectType: PropControlDefinition<string> = {
  Editor: SelectPropEditor,
};

export default SelectType;
