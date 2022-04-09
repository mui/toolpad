import * as React from 'react';
import { Stack, StackProps } from '@mui/material';

export interface PageRowProps {
  spacing?: number;
  children?: React.ReactNode;
  alignItems?: StackProps['alignItems'];
  justifyContent?: StackProps['justifyContent'];
}

export default function PageRow({ spacing, children, alignItems, justifyContent }: PageRowProps) {
  return (
    <Stack direction="row" sx={{ gap: spacing, p: spacing, alignItems, justifyContent }}>
      {children}
    </Stack>
  );
}

PageRow.defaultProps = {
  spacing: 2,
  alignItems: 'start',
  justifyContent: 'start',
};
