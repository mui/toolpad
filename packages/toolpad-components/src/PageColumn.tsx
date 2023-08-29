import * as React from 'react';
import { Box } from '@mui/material';
import createBuiltin from './createBuiltin';

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

export default createBuiltin(PageColumn, {
  helperText: 'A page column component.',
  argTypes: {
    gap: {
      helperText: 'The gap between children.',
      type: 'number',
      default: 1,
    },
    children: {
      helperText: 'The content of the component.',
      type: 'element',
      control: { type: 'slots' },
    },
  },
});
