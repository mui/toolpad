import * as React from 'react';
import { Box } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

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

export default createComponent(PageRow, {
  argTypes: {
    gap: {
      type: 'number',
      default: 1,
      minimum: 1,
    },
    children: {
      type: 'element',
      control: { type: 'slots' },
    },
  },
});
