import * as React from 'react';
import { Box } from '@mui/material';
import { createComponent } from '@mui/toolpad/browser';

export interface LabelColumnProps {
  value: number;
}

function LabelColumn({ value }: LabelColumnProps) {
  return <Box sx={{ color: value >= 0 ? 'success.main' : 'error.main' }}>{value}</Box>;
}

export default createComponent(LabelColumn, {
  argTypes: {
    value: {
      typeDef: { type: 'number' },
    },
  },
});
