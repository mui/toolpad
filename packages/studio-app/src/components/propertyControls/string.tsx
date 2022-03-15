import { TextField } from '@mui/material';
import * as React from 'react';
import type { EditorProps, PropControlDefinition } from '../../types';

function StringPropEditor({ label, value, onChange, disabled }: EditorProps<string>) {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange],
  );
  return (
    <TextField
      fullWidth
      value={value ?? ''}
      disabled={disabled}
      onChange={handleChange}
      label={label}
      size="small"
    />
  );
}

const stringType: PropControlDefinition<string> = {
  Editor: StringPropEditor,
};

export default stringType;
