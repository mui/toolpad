import * as React from 'react';
import { DatePicker } from '@toolpad/studio-components';
import Stack from '@mui/material/Stack';

export default function DatePickerDisabled() {
  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <DatePicker variant="outlined" size="small" disabled label="Disabled" />
      <DatePicker variant="outlined" size="small" label="Active" />
    </Stack>
  );
}
