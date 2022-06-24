import * as React from 'react';
import { Box, StackProps } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

export interface PageRowProps {
  gap?: number;
  children?: React.ReactNode;
  alignItems?: StackProps['alignItems'];
  justifyContent?: StackProps['justifyContent'];
}

function PageRow({ gap, children, alignItems, justifyContent }: PageRowProps) {
  return (
    <Box
      sx={{
        gap,
        alignItems,
        justifyContent,
        width: '100%',
        display: 'grid',
        gridAutoFlow: 'column',
        gridAutoColumns: 'minmax(0, 1fr)',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  );
}

export default createComponent(PageRow, {
  argTypes: {
    gap: {
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
