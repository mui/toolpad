import * as React from 'react';
import { Button } from '@mui/toolpad-components';
import { Stack } from '@mui/material';

export default function BasicButton() {
  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <Button content="Loading" variant="contained" loading />
      <Button content="Disabled" variant="contained" disabled />
    </Stack>
  );
}
