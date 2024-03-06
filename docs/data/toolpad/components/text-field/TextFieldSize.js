import * as React from 'react';
import { TextField } from '@mui/toolpad-components';
import { Stack } from '@mui/material';

export default function BasicButton() {
  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <TextField size="small" variant="outlined" label="Small" />
      <TextField size="medium" variant="outlined" label="Medium" />
    </Stack>
  );
}
