import * as React from 'react';
import { Button } from '@mui/toolpad-components';
import { Stack } from '@mui/material';

export default function BasicButton() {
  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <Button color="primary" content="Primary" variant="contained" />
      <Button color="secondary" content="Secondary" variant="contained" />
      <Button color="primary" content="Primary" variant="outlined" />
    </Stack>
  );
}
