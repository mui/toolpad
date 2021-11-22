import { TextField } from '@mui/material';
import * as React from 'react';
import { EditorProps, PropTypeDefinition } from '../types';

function StringPropEditor({ name, value, onChange, disabled }: EditorProps<string>) {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange],
  );
  return (
    <TextField
      fullWidth
      value={value}
      disabled={disabled}
      onChange={handleChange}
      label={name}
      size="small"
    />
  );
}

const stringType: PropTypeDefinition<string> = {
  Editor: StringPropEditor,
};

export default stringType;
