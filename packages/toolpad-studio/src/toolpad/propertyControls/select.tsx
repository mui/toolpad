import { MenuItem, TextField } from '@mui/material';
import * as React from 'react';
import type { EditorProps } from '../../types';
import PropertyControl from '../../components/PropertyControl';

function SelectPropEditor({ label, propType, value, onChange, disabled }: EditorProps<string>) {
  const items = propType.type === 'string' ? propType.enum ?? [] : [];
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value || undefined);
    },
    [onChange],
  );

  const enumLabels: Record<string, string> =
    propType.type === 'string' ? propType.enumLabels ?? {} : {};

  return (
    <PropertyControl propType={propType}>
      <TextField
        select
        fullWidth
        label={label}
        value={value ?? ''}
        disabled={disabled}
        onChange={handleChange}
      >
        {typeof propType.default === 'undefined' ? <MenuItem value="">-</MenuItem> : null}
        {items.map((item) => (
          <MenuItem key={item} value={item}>
            {enumLabels[item] || item}
          </MenuItem>
        ))}
      </TextField>
    </PropertyControl>
  );
}

export default SelectPropEditor;
