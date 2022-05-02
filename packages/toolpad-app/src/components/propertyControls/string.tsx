import { TextField } from '@mui/material';
import * as React from 'react';
import type { EditorProps, PropControlDefinition } from '../../types';

function StringPropEditor({ label, value, onChange, disabled }: EditorProps<string>) {
  const [localValue, setLocalValue] = React.useState(value);
  const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout>();

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(event.target.value);

      setTimeoutId(
        setTimeout(() => {
          onChange(event.target.value);
        }, 300),
      );
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    },
    [timeoutId, onChange],
  );
  return (
    <TextField
      fullWidth
      value={localValue ?? ''}
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
