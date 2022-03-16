import * as React from 'react';
import { Stack, StackProps } from '@mui/material';

export interface PageRowProps {
  spacing?: number;
  children?: React.ReactNode;
  alignItems?: StackProps['alignItems'];
}

export default function PageRow({ spacing, children, alignItems }: PageRowProps) {
  return (
    <Stack direction="row" sx={{ gap: spacing, p: spacing, alignItems }}>
      {children}
    </Stack>
  );
}
