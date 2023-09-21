import * as React from 'react';
import { Button, Stack } from '@mui/toolpad-components';

const TOOLPAD_PROPS1 = {
  size: 'small',
  variant: 'contained',
  content: 'Size',
};

const TOOLPAD_PROPS2 = {
  size: 'medium',
  variant: 'contained',
  content: 'Size',
};

const TOOLPAD_PROPS3 = {
  size: 'large',
  variant: 'contained',
  content: 'Size',
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
