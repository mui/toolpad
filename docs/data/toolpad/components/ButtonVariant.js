import * as React from 'react';
import { Button, Stack } from '@mui/toolpad-components';

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

export default function BasicButton() {
  return (
    <Stack spacing={2} direction="row">
      <Button {...TOOLPAD_PROPS1} />
      <Button {...TOOLPAD_PROPS2} />
      <Button {...TOOLPAD_PROPS3} />
    </Stack>
  );
}
