import * as React from 'react';
import { TextField } from '@mui/toolpad-components';
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
      <TextField {...TOOLPAD_PROPS1} />
      <TextField {...TOOLPAD_PROPS2} />
      <TextField {...TOOLPAD_PROPS3} />
    </Stack>
  );
}
