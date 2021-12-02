import * as React from 'react';
import { Paper, PaperProps } from '@mui/material';
import { createComponent } from '@mui/studio-core';

function PaperComponent({ children, ...props }: PaperProps) {
  return (
    <Paper sx={{ padding: 1 }} {...props}>
      {children}
    </Paper>
  );
}

export default createComponent(PaperComponent, {
  props: {
    elevation: {
      type: 'number',
      defaultValue: 1,
    },
  },
});
