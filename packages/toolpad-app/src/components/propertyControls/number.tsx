import { TextField } from '@mui/material';
import * as React from 'react';
import type { EditorProps } from '../../types';

function NumberPropEditor({ label, value, onChange, disabled }: EditorProps<number>) {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(event.target.value));
    },
    [onChange],
  );

  return (
    <TextField
      fullWidth
      value={String(value ?? 0)}
      disabled={disabled}
      type="number"
      onChange={handleChange}
      label={label}
      size="small"
    />
  );
}

export default NumberPropEditor;
