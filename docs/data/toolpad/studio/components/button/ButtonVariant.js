import * as React from 'react';
import { Button } from '@toolpad/studio-components';
import { Stack } from '@mui/material';

const TOOLPAD_PROPS1 = {
  variant: 'contained',
  content: 'Contained',
};

const TOOLPAD_PROPS2 = {
  variant: 'outlined',
  content: 'Outlined',
};

const TOOLPAD_PROPS3 = {
  variant: 'text',
  content: 'Text',
};

export default function ButtonVariant() {
  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <Button {...TOOLPAD_PROPS1} />
      <Button {...TOOLPAD_PROPS2} />
      <Button {...TOOLPAD_PROPS3} />
    </Stack>
  );
}
