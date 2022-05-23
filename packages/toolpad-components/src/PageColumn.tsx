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
        p: spacing,
        alignItems,
        width: `${(span / 12) * 100}vw`,
      }}
    >
      {children}
    </Stack>
  );
}

PageColumn.defaultProps = {
  spacing: 2,
  span: 1,
  alignItems: 'center',
};

export default createComponent(PageColumn, {
  argTypes: {
    span: {
      typeDef: { type: 'number' },
    },
    spacing: {
      typeDef: { type: 'number' },
    },
    alignItems: {
      typeDef: {
        type: 'string',
        enum: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
      },
      label: 'Horizontal alignment',
      control: { type: 'HorizontalAlign' },
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slots' },
    },
  },
});
