import * as React from 'react';
import { DatePicker } from '@mui/toolpad-components';
import { Stack } from '@mui/material';

const TOOLPAD_PROPS1 = {
  variant: 'outlined',
  size: 'small',
  disabled: true,
  label: 'Disabled',
};

const TOOLPAD_PROPS2 = {
  variant: 'outlined',
  label: 'Active',
  size: 'small',
  disabled: false,
};

export default function BasicButton() {
  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <DatePicker {...TOOLPAD_PROPS1} />
      <DatePicker {...TOOLPAD_PROPS2} />
    </Stack>
  );
}
