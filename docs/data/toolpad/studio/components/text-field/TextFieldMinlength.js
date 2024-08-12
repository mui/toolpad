import * as React from 'react';
import { TextField } from '@toolpad/studio-components';

export default function TextFieldMinlength() {
  return (
    <TextField
      label="Password"
      size="small"
      minLength="6"
      placeholder="Enter password"
      password
      isRequired
    />
  );
}
