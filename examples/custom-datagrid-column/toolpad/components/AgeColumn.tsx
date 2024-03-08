import * as React from 'react';
import { Typography } from '@mui/material';
import { createComponent } from '@toolpad/studio/browser';

export interface AgeColumnProps {
  value: number;
}

function AgeColumn({ value }: AgeColumnProps) {
  return (
    <Typography sx={{ color: value >= 18 ? 'success.main' : 'error.main' }}>{value}</Typography>
  );
}

export default createComponent(AgeColumn, {
  argTypes: {
    value: {
      type: 'number',
    },
  },
});
