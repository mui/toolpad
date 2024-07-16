'use client';
import * as React from 'react';
import Stack from '@mui/material/Stack';

export interface PageContainerToolbarProps {
  children?: React.ReactNode;
}

export /**
 *
 * Demos:
 *
 * - [Page Container](https://mui.com/toolpad/core/react-page-content/)
 *
 * API:
 *
 * - [PageContainerToolbar API](https://mui.com/toolpad/core/api/page-container-toolbar)
 */ function PageContainerToolbar({ children }: PageContainerToolbarProps) {
  return (
    <Stack direction="row" spacing={1}>
      {children}
    </Stack>
  );
}
