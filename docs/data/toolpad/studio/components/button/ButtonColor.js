import * as React from 'react';
import { Button } from '@toolpad/studio-components';
import { Stack } from '@mui/material';

const TOOLPAD_PROPS1 = {
  color: 'primary',
  content: 'Primary',
  variant: 'contained',
};

const TOOLPAD_PROPS2 = {
  color: 'secondary',
  content: 'Secondary',
  variant: 'contained',
};

const TOOLPAD_PROPS3 = {
  color: 'primary',
  content: 'Primary',
  variant: 'outlined',
};

export default function BasicButton() {
  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <Button {...TOOLPAD_PROPS1} />
      <Button {...TOOLPAD_PROPS2} />
      <Button {...TOOLPAD_PROPS3} />
    </Stack>
  );
}
