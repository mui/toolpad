import * as React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

export default function Buttons() {
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Button variant="contained">Button</Button>
    </Box>
  );
}
