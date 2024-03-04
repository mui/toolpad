import * as React from 'react';
import { Button } from '@mui/toolpad-components';
import { Stack } from '@mui/material';

export default function BasicButton() {
  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <Button variant="contained" content="Contained" />
      <Button variant="outlined" content="Outlined" />
      <Button variant="text" content="Text" />
    </Stack>
  );
}
