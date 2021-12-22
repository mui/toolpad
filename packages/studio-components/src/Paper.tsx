import * as React from 'react';
import Paper, { PaperProps } from '@mui/material/Paper';
import { createComponent, Slot } from '@mui/studio-core';

const PaperComponent = React.forwardRef(function PaperComponent(
  { children, ...props }: PaperProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <Paper ref={ref} sx={{ padding: 1 }} {...props}>
      <Slot name="content">{children}</Slot>
    </Paper>
  );
});

export default createComponent(PaperComponent, {
  props: {
    elevation: {
      type: 'number',
      defaultValue: 1,
    },
    children: {
      type: 'slot',
    },
  },
});
