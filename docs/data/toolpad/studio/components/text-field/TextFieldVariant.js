import * as React from 'react';
import { TextField } from '@toolpad/studio-components';
import Stack from '@mui/material/Stack';

export default function TextFieldVariant() {
  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <TextField size="small" variant="outlined" label="Outlined" />
      <TextField size="small" variant="filled" label="Filled" />
      <TextField size="small" variant="standard" label="Standard" />
    </Stack>
  );
}
