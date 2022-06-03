import * as React from 'react';
import { Stack, StackProps } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

export interface PageRowProps {
  spacing?: number;
  children?: React.ReactNode;
  alignItems?: StackProps['alignItems'];
  justifyContent?: StackProps['justifyContent'];
}

function PageRow({ spacing, children, alignItems, justifyContent }: PageRowProps) {
  return (
    <Stack
      direction="row"
      sx={{
        gap: spacing,
        alignItems,
        justifyContent,
        width: '100%',
      }}
    >
      {children}
    </Stack>
  );
}

export default createComponent(PageRow, {
  argTypes: {
    spacing: {
      typeDef: { type: 'number' },
      defaultValue: 1,
    },
    alignItems: {
      typeDef: {
        type: 'string',
        enum: ['start', 'center', 'end', 'stretch', 'baseline'],
      },
      label: 'Vertical alignment',
      control: { type: 'VerticalAlign' },
      defaultValue: 'center',
    },
    justifyContent: {
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
