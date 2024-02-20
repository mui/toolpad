import * as React from 'react';
import { Box } from '@mui/material';
import { createComponent } from '@mui/toolpad/browser';

function FullWidth() {
  return <Box sx={{ width: '100%' }}>fullwidth</Box>;
}

export default createComponent(FullWidth);
