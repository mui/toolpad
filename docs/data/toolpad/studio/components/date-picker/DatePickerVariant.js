import * as React from 'react';
import { DatePicker } from '@toolpad/studio-components';
import Stack from '@mui/material/Stack';

export default function DatePickerVariant() {
  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <DatePicker size="small" variant="outlined" label="Outlined" />
      <DatePicker size="small" variant="filled" label="Filled" />
      <DatePicker size="small" variant="standard" label="Standard" />
    </Stack>
  );
}
