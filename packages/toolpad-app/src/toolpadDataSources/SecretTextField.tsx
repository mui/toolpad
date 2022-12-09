import * as React from 'react';
import { TextFieldProps, TextField } from '@mui/material';
import { SecretsAction } from '../types';

export interface SecretTextFieldProps extends Omit<TextFieldProps, 'value' | 'onChange'> {
  value?: SecretsAction;
  onChange?: (newValue: SecretsAction) => void;
}

export default function SecretTextField({ value, onChange, ...props }: SecretTextFieldProps) {
  return (
    <TextField
      type="password"
      InputLabelProps={value?.kind === 'keep' ? { shrink: true } : {}}
      placeholder={value?.kind === 'keep' ? '*** encrypted server-side ***' : undefined}
      value={value?.kind === 'set' ? value.value : null}
      onChange={(event) => onChange?.({ kind: 'set', value: event.target.value })}
      {...props}
    />
  );
}
