import { Checkbox, FormControlLabel } from '@mui/material';
import * as React from 'react';
import type { EditorProps, PropControlDefinition } from '../../types';

function BooleanPropEditor({ propName, value, onChange, disabled }: EditorProps<boolean>) {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked);
    },
    [onChange],
  );

  return (
    <FormControlLabel
      control={<Checkbox checked={!!value} disabled={disabled} onChange={handleChange} />}
      label={propName}
    />
  );
}

const booleanType: PropControlDefinition<boolean> = {
  Editor: BooleanPropEditor,
};

export default booleanType;
