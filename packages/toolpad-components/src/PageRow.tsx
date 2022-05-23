import * as React from 'react';
import { Stack } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';

export interface PageRowProps {
  children?: React.ReactNode;
}

function PageRow({ children }: PageRowProps) {
  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'start',
        justifyContent: 'start',
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
      defaultValue: 2,
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
