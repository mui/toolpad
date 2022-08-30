import { TextField } from '@mui/material';
import * as React from 'react';
import type { EditorProps } from '../../types';

function NumberPropEditor({
  label,
  value,
  onChange,
  disabled,
  minValue,
  maxValue,
}: EditorProps<number>) {
  const [inputValue, setInputValue] = React.useState(value);

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(event.target.value);

      setInputValue(newValue);

      if (minValue && newValue < minValue) {
        onChange(minValue);
      } else if (maxValue && newValue > maxValue) {
        onChange(maxValue);
      } else {
        onChange(newValue);
      }
    },
    [maxValue, minValue, onChange],
  );

  const handleBlur = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const newValue = Number(event.target.value);

      if (minValue && newValue < minValue) {
        setInputValue(minValue);
      } else if (maxValue && newValue > maxValue) {
        setInputValue(maxValue);
      }
    },
    [maxValue, minValue],
  );

  return (
    <TextField
      fullWidth
      value={String(inputValue ?? 0)}
      disabled={disabled}
      type="number"
      onChange={handleChange}
      onBlur={handleBlur}
      label={label}
    />
  );
}

export default NumberPropEditor;
