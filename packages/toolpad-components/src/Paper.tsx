import * as React from 'react';
import { Paper as MuiPaper, PaperProps as MuiPaperProps } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

function Paper({ children, sx, ...props }: MuiPaperProps) {
  return (
    <MuiPaper sx={{ padding: 1, width: '100%', ...sx }} {...props}>
      {children}
    </MuiPaper>
  );
}

export default createComponent(Paper, {
  layoutDirection: 'vertical',
  argTypes: {
    elevation: {
      typeDef: { type: 'number', minimum: 0 },
      defaultValue: 1,
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'layoutSlot' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
});
