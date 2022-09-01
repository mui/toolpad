import { TextField } from '@mui/material';
import { NumberValueType } from '@mui/toolpad-core';
import * as React from 'react';
import type { EditorProps } from '../../types';

type NumberPropEditorProps = EditorProps<number> & { propType: NumberValueType };

function NumberPropEditor({ label, value, onChange, disabled, propType }: NumberPropEditorProps) {
  const { minimum, maximum } = propType;

  const [inputValue, setInputValue] = React.useState(value);

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(event.target.value);

      setInputValue(newValue);

      if (minimum && newValue < minimum) {
        onChange(minimum);
      } else if (maximum && newValue > maximum) {
        onChange(maximum);
      } else {
        onChange(newValue);
      }
    },
    [maximum, minimum, onChange],
  );

  const handleBlur = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const blurValue = Number(event.target.value);

      if (minimum && blurValue < minimum) {
        setInputValue(minimum);
      } else if (maximum && blurValue > maximum) {
        setInputValue(maximum);
      }
    },
    [maximum, minimum],
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
