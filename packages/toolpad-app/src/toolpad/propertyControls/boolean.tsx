import { Checkbox, FormControlLabel } from '@mui/material';
import * as React from 'react';
import type { EditorProps } from '../../types';
import PropertyControl from '../../components/PropertyControl';

function BooleanPropEditor({ propType, label, value, onChange, disabled }: EditorProps<boolean>) {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked);
    },
    [onChange],
  );

  return (
    <PropertyControl propType={propType}>
      <FormControlLabel
        control={<Checkbox checked={!!value} disabled={disabled} onChange={handleChange} />}
        label={label}
      />
    </PropertyControl>
  );
}

export default BooleanPropEditor;
