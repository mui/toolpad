import * as React from 'react';
import { TextField } from '@toolpad/studio-components';
import Stack from '@mui/material/Stack';

export default function TextFieldDisabled() {
  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <TextField variant="outlined" size="small" disabled label="Disabled" />
      <TextField variant="outlined" size="small" label="Active" />
    </Stack>
  );
}
