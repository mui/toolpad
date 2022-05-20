import * as React from 'react';
import { Stack, StackProps } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

export interface PageColumnProps {
  span: number;
  spacing?: number;
  children?: React.ReactNode;
  alignItems?: StackProps['alignItems'];
  justifyContent?: StackProps['justifyContent'];
}

function PageColumn({ span, spacing, children, alignItems, justifyContent }: PageColumnProps) {
  return (
    <Stack
      direction="column"
      sx={{
        gap: spacing,
        p: spacing,
        alignItems,
        justifyContent,
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
  justifyContent: 'start',
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
    justifyContent: {
      typeDef: {
        type: 'string',
        enum: ['start', 'center', 'end', 'stretch', 'baseline'],
      },
      label: 'Vertical alignment',
      control: { type: 'VerticalAlign' },
    },
    children: {
      typeDef: { type: 'element' },
      control: { type: 'slots' },
    },
  },
});
