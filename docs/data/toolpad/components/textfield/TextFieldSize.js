import * as React from 'react';
import { TextField } from '@mui/toolpad-components';
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
      <TextField {...TOOLPAD_PROPS1} />
      <TextField {...TOOLPAD_PROPS2} />
    </Stack>
  );
}
