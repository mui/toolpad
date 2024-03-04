import * as React from 'react';
import { Button } from '@mui/toolpad-components';
import Stack from '@mui/material/Stack';

export default function BasicButton() {
  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <Button size="small" variant="contained" content="Small" />
      <Button size="medium" variant="contained" content="Medium" />
      <Button size="large" variant="contained" content="Large" />
    </Stack>
  );
}
