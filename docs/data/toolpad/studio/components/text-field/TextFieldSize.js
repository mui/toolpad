import * as React from 'react';
import { TextField } from '@toolpad/studio-components';
import Stack from '@mui/material/Stack';

export default function TextFieldSize() {
  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <TextField size="small" variant="outlined" label="Small" />
      <TextField size="medium" variant="outlined" label="Medium" />
    </Stack>
  );
}
