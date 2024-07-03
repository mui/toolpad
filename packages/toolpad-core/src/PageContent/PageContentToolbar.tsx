'use client';
import * as React from 'react';
import Stack from '@mui/material/Stack';

export interface PageContentToolbarProps {
  children?: React.ReactNode;
}

export/**
 *
 * Demos:
 *
 * - [Page Content](https://mui.com/toolpad/core/react-page-content/)
 *
 * API:
 *
 * - [PageContentToolbar API](https://mui.com/toolpad/core/api/page-content-toolbar)
 */ function PageContentToolbar({ children }: PageContentToolbarProps) {
  return (
    <Stack direction="row" spacing={1}>
      {children}
    </Stack>
  );
}
