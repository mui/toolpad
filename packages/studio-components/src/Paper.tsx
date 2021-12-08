import * as React from 'react';
import Paper, { PaperProps } from '@mui/material/Paper';
import { createComponent, Slot } from '@mui/studio-core';

function PaperComponent({ children, ...props }: PaperProps) {
  return (
    <Paper sx={{ padding: 1 }} {...props}>
      <Slot name="content">{children}</Slot>
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
