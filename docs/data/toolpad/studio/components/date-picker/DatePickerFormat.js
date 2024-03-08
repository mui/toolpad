import * as React from 'react';
import { DatePicker } from '@mui/toolpad-components';
import { Stack } from '@mui/material';

export default function BasicButton() {
  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <DatePicker
        size="small"
        variant="outlined"
        label="MM/DD/YYYY"
        format="MM/DD/YYYY"
      />
      <DatePicker size="small" variant="outlined" label="MMMM-YY" format="MMMM-YY" />
    </Stack>
  );
}
