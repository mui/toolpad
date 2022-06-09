import * as React from 'react';
import { Stack, StackProps } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

export interface PageColumnProps {
  span: number;
  gap?: number;
  children?: React.ReactNode;
  alignItems?: StackProps['alignItems'];
}

function PageColumn({ span, gap, children, alignItems }: PageColumnProps) {
  return (
    <Stack
      direction="column"
      sx={{
        gap,
        alignItems,
        width: `${(span / 12) * 100}vw`,
        maxWidth: '100%',
      }}
    >
      {children}
    </Stack>
  );
}

export default createComponent(PageColumn, {
  argTypes: {
    span: {
      typeDef: { type: 'number' },
      defaultValue: 4,
    },
    gap: {
      typeDef: { type: 'number' },
      defaultValue: 1,
    },
    alignItems: {
      typeDef: {
        type: 'string',
        enum: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
      },
      label: 'Horizontal alignment',
      control: { type: 'HorizontalAlign' },
      defaultValue: 'center',
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slots' },
    },
  },
});
