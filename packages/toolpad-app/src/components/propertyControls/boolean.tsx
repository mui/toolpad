import { Checkbox, FormControlLabel } from '@mui/material';
import * as React from 'react';
import type { EditorProps } from '../../types';

function BooleanPropEditor({ label, value, onChange, disabled }: EditorProps<boolean>) {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked);
    },
    [onChange],
  );

  return (
    <FormControlLabel
      control={<Checkbox checked={!!value} disabled={disabled} onChange={handleChange} />}
      label={label}
    />
  );
}

export default BooleanPropEditor;
