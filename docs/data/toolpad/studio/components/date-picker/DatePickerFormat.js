import * as React from 'react';
import { DatePicker } from '@toolpad/studio-components';
import Stack from '@mui/material/Stack';

export default function DatePickerFormat() {
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
