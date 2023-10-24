import * as React from 'react';
import { TextField } from '@mui/toolpad-components';
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
      <TextField {...TOOLPAD_PROPS1} />
      <TextField {...TOOLPAD_PROPS2} />
    </Stack>
  );
}
