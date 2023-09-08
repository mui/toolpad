import * as React from 'react';
import { Box } from '@mui/material';
import createBuiltin from './createBuiltin';

export interface PageRowProps {
  layoutColumnSizes?: number[];
  gap?: number;
  children?: React.ReactNode;
}

function PageRow({ layoutColumnSizes = [], gap, children }: PageRowProps) {
  const gridAutoColumns = layoutColumnSizes.reduce(
    (acc, layoutColumnSize) => `${acc}${`${acc && ' '}minmax(0, ${layoutColumnSize || 1}fr)`}`,
    '',
  );

  return (
    <Box
      sx={{
        gap,
        display: 'grid',
        gridAutoFlow: 'column',
        gridAutoColumns,
      }}
    >
      {children}
    </Box>
  );
}

export default createBuiltin(PageRow, {
  helperText: 'A page row component.',
  argTypes: {
    gap: {
      helperText: 'The gap between children.',
      type: 'number',
      default: 1,
      minimum: 1,
    },
    children: {
      helperText: 'The content of the component.',
      type: 'element',
      control: { type: 'slots' },
    },
  },
});
