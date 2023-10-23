import * as React from 'react';
import { DatePicker } from '@mui/toolpad-components';
import { Stack } from '@mui/material';

const TOOLPAD_PROPS1 = {
  size: 'small',
  variant: 'outlined',
  label: 'Small',
};

const TOOLPAD_PROPS2 = {
  size: 'medium',
  variant: 'outlined',
  label: 'Medium',
};

export default function BasicButton() {
  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <DatePicker {...TOOLPAD_PROPS1} />
      <DatePicker {...TOOLPAD_PROPS2} />
    </Stack>
  );
}
