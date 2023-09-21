import * as React from 'react';
import { Button, Stack } from '@mui/toolpad-components';

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
    <Stack spacing={2} direction="row">
      <Button {...TOOLPAD_PROPS1} />
      <Button {...TOOLPAD_PROPS2} />
      <Button {...TOOLPAD_PROPS3} />
    </Stack>
  );
}
