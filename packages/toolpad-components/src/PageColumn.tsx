import * as React from 'react';
import { Box } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

export interface PageColumnProps {
  gap?: number;
  children?: React.ReactNode;
}

function PageColumn({ gap, children }: PageColumnProps) {
  return (
    <Box
      sx={{
        gap,
        display: 'grid',
        gridAutoFlow: 'row',
        gridAutoRows: 'fit-content',
        gridAutoColumns: '100%',
      }}
    >
      {children}
    </Box>
  );
}

export default createComponent(PageColumn, {
  argTypes: {
    gap: {
      type: 'number',
      default: 1,
    },
    children: {
      type: 'element',
      control: { type: 'slots' },
    },
  },
});
