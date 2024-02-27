import * as React from 'react';
import { DatePicker } from '@mui/toolpad-components';
import { Stack } from '@mui/material';

export default function BasicButton() {
  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <DatePicker size="small" variant="outlined" label="Outlined" />
      <DatePicker size="small" variant="filled" label="Filled" />
      <DatePicker size="small" variant="standard" label="Standard" />
    </Stack>
  );
}
