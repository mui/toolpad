import * as React from 'react';
import { Stack, StackProps } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

export interface PageColumnProps {
  span: number;
  spacing?: number;
  children?: React.ReactNode;
  alignItems?: StackProps['alignItems'];
}

function PageColumn({ span, spacing, children, alignItems }: PageColumnProps) {
  return (
    <Stack
      direction="column"
      sx={{
        gap: spacing,
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
    spacing: {
      typeDef: { type: 'number' },
      defaultValue: 2,
    },
    alignItems: {
      typeDef: {
        type: 'string',
        enum: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
      },
      label: 'Horizontal alignment',
      control: { type: 'HorizontalAlign' },
      defaultValue: 'start',
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slots' },
    },
  },
});
