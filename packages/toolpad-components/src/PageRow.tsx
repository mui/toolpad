import * as React from 'react';
import { Stack, StackProps } from '@mui/material';
import { ComponentConfig } from '@mui/toolpad-core';

export interface PageRowProps {
  spacing?: number;
  children?: React.ReactNode;
  alignItems?: StackProps['alignItems'];
  justifyContent?: StackProps['justifyContent'];
}

export default function PageRow({ spacing, children, alignItems, justifyContent }: PageRowProps) {
  return (
    <Stack
      direction="row"
      sx={{ gap: spacing, p: spacing, alignItems, justifyContent, flexWrap: 'wrap' }}
    >
      {children}
    </Stack>
  );
}

PageRow.defaultProps = {
  spacing: 2,
  alignItems: 'start',
  justifyContent: 'start',
};

export const config: ComponentConfig<PageRowProps> = {
  argTypes: {
    spacing: {
      typeDef: { type: 'number' },
    },
    alignItems: {
      typeDef: {
        type: 'string',
        enum: ['start', 'center', 'end', 'stretch', 'baseline'],
      },
      label: 'Vertical alignment',
      control: { type: 'VerticalAlign' },
    },
    justifyContent: {
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
};
