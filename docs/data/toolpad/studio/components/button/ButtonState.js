import * as React from 'react';
import { Button } from '@toolpad/studio-components';
import { Stack } from '@mui/material';

const TOOLPAD_PROPS1 = {
  content: 'Loading',
  variant: 'contained',
  loading: true,
};

const TOOLPAD_PROPS2 = {
  content: 'Disabled',
  variant: 'contained',
  disabled: true,
};

export default function BasicButton() {
  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <Button {...TOOLPAD_PROPS1} />
      <Button {...TOOLPAD_PROPS2} />
    </Stack>
  );
}
