import * as React from 'react';
import { Paper as MuiPaper, PaperProps as MuiPaperProps, Stack, StackProps } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

export type PaperProps = MuiPaperProps & {
  direction?: StackProps['direction'];
  gap?: StackProps['gap'];
};

function Paper({ direction, gap, children, sx, ...props }: PaperProps) {
  return (
    <MuiPaper sx={{ padding: 1, ...sx }} {...props}>
      <Stack direction={direction} gap={gap}>
        {children}
      </Stack>
    </MuiPaper>
  );
}

export default createComponent(Paper, {
  layoutDirection: 'both',
  argTypes: {
    elevation: {
      typeDef: { type: 'number', minimum: 0 },
      defaultValue: 1,
    },
    direction: {
      typeDef: {
        type: 'string',
        enum: ['row', 'row-reverse', 'column', 'column-reverse'],
      },
      defaultValue: 'row',
    },
    gap: {
      typeDef: { type: 'number' },
      defaultValue: 2,
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slots' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
});
