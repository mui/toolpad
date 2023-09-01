import { TextField } from '@mui/material';
import * as React from 'react';
import type { EditorProps } from '../../types';
import PropertyControl from '../../components/PropertyControl';

function StringPropEditor({ propType, label, value, onChange, disabled }: EditorProps<string>) {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value === propType.default ? undefined : event.target.value);
    },
    [onChange, propType.default],
  );

  return (
    <PropertyControl propType={propType}>
      <TextField
        fullWidth
        value={value ?? ''}
        disabled={disabled}
        onChange={handleChange}
        label={label}
      />
    </PropertyControl>
  );
}

export default StringPropEditor;
