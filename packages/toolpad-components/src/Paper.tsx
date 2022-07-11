import * as React from 'react';
import { Paper as MuiPaper, PaperProps } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

function Paper({ children, sx, ...props }: PaperProps) {
  return (
    <MuiPaper sx={{ padding: 1, ...sx }} {...props}>
      {children}
    </MuiPaper>
  );
}

export default createComponent(Paper, {
  argTypes: {
    elevation: {
      typeDef: { type: 'number', minimum: 0 },
      defaultValue: 1,
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slot' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
});
