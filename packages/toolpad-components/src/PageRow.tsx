import * as React from 'react';
import { Box } from '@mui/material';
import createBuiltin from './createBuiltin';

export interface PageRowProps {
  layoutColumnSizes?: number[];
  gap?: number;
  children?: React.ReactNode;
}

const PageRow = React.forwardRef(function PageRow(
  { layoutColumnSizes = [], gap, children, ...props }: PageRowProps,
  ref,
) {
  const gridAutoColumns = layoutColumnSizes.reduce(
    (acc, layoutColumnSize) => `${acc}${`${acc && ' '}minmax(0, ${layoutColumnSize || 1}fr)`}`,
    '',
  );

  return (
    <Box
      ref={ref}
      sx={{
        gap,
        display: 'grid',
        gridAutoFlow: 'column',
        gridAutoColumns,
      }}
      {...props}
    >
      {children}
    </Box>
  );
});

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
