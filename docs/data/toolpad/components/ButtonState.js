import * as React from 'react';
import { Button, Stack } from '@mui/toolpad-components';

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
    <Stack spacing={2} direction="row">
      <Button {...TOOLPAD_PROPS1} />
      <Button {...TOOLPAD_PROPS2} />
    </Stack>
  );
}
