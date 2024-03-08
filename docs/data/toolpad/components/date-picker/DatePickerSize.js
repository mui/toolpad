import * as React from 'react';
import { DatePicker } from '@toolpad/studio-components';
import { Stack } from '@mui/material';

export default function BasicButton() {
  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <DatePicker size="small" variant="outlined" label="Small" />
      <DatePicker size="medium" variant="outlined" label="Medium" />
    </Stack>
  );
}
