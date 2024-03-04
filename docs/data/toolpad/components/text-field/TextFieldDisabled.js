import * as React from 'react';
import { TextField } from '@mui/toolpad-components';
import { Stack } from '@mui/material';

export default function BasicButton() {
  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <TextField variant="outlined" size="small" disabled label="Disabled" />
      <TextField variant="outlined" size="small" label="Active" />
    </Stack>
  );
}
