import * as React from 'react';
import { Box } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

export interface PageRowProps {
  gap?: number;
  children?: React.ReactNode;
}

function PageRow({ gap, children }: PageRowProps) {
  return (
    <Box
      sx={{
        gap,
        display: 'grid',
        gridAutoFlow: 'column',
        gridAutoColumns: 'minmax(0, 1fr)',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  );
}

export default createComponent(PageRow, {
  argTypes: {
    gap: {
      typeDef: { type: 'number' },
      defaultValue: 1,
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slots' },
    },
  },
});
