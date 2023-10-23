import * as React from 'react';
import { DatePicker } from '@mui/toolpad-components';
import { Stack } from '@mui/material';

const TOOLPAD_PROPS1 = {
  size: 'small',
  variant: 'outlined',
  label: 'Outlined',
};

const TOOLPAD_PROPS2 = {
  size: 'small',
  variant: 'filled',
  label: 'Filled',
};

const TOOLPAD_PROPS3 = {
  size: 'small',
  variant: 'standard',
  label: 'Standard',
};

export default function BasicButton() {
  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <DatePicker {...TOOLPAD_PROPS1} />
      <DatePicker {...TOOLPAD_PROPS2} />
      <DatePicker {...TOOLPAD_PROPS3} />
    </Stack>
  );
}
