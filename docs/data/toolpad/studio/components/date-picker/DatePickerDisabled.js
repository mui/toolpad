import * as React from 'react';
import { DatePicker } from '@toolpad/studio-components';
import { Stack } from '@mui/material';

export default function BasicButton() {
  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <DatePicker variant="outlined" size="small" disabled label="Disabled" />
      <DatePicker variant="outlined" size="small" label="Active" />
    </Stack>
  );
}
