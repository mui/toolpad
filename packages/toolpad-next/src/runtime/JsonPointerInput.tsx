import * as React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import * as jsonPath from '../shared/jsonPointer';

export interface JsonPointerInputProps {
  value: string;
  onChange: (newValue: string) => void;
  filter?: (value: unknown) => boolean;
  label?: string;
  fullWidth?: boolean;
  helperText?: React.ReactNode;
  target?: unknown;
}

export default function JsonPointerInput({
  target,
  value,
  onChange,
  filter,
  ...props
}: JsonPointerInputProps) {
  const options = React.useMemo(
    () =>
      jsonPath
        .generateSuggestions(target, {
          filter,
        })
        .map((suggestion) => suggestion.pointer),
    [target, filter],
  );

  return (
    <Autocomplete
      freeSolo
      options={options}
      value={value}
      onChange={(event, newValue) => onChange(newValue ?? '')}
      renderInput={(params) => <TextField {...props} {...params} />}
    />
  );
}
