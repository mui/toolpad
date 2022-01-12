import { TextField } from '@mui/material';
import * as React from 'react';
import type { EditorProps, PropControlDefinition } from '../../types';

function NumberPropEditor({ name, value, onChange, disabled }: EditorProps<number>) {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(event.target.value));
    },
    [onChange],
  );

  return (
    <TextField
      fullWidth
      value={String(value)}
      disabled={disabled}
      type="number"
      onChange={handleChange}
      label={name}
      size="small"
    />
  );
}

const numberType: PropControlDefinition<number> = {
  Editor: NumberPropEditor,
};

export default numberType;
