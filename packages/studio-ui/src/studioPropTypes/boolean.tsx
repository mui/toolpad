import { Checkbox, FormControlLabel } from '@mui/material';
import * as React from 'react';
import type { EditorProps, PropTypeDefinition } from '../types';

function BooleanPropEditor({ name, value, onChange, disabled }: EditorProps<boolean>) {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked);
    },
    [onChange],
  );

  return (
    <FormControlLabel
      control={<Checkbox checked={!!value} disabled={disabled} onChange={handleChange} />}
      label={name}
    />
  );
}

const booleanType: PropTypeDefinition<boolean> = {
  Editor: BooleanPropEditor,
};

export default booleanType;
