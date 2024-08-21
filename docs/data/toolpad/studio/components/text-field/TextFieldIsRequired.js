import * as React from 'react';
import { TextField } from '@toolpad/studio-components';

export default function TextFieldIsRequired() {
  return (
    <TextField
      label="Name"
      size="small"
      placeholder="Enter name"
      isRequired
      sx={{ width: 280 }}
    />
  );
}
