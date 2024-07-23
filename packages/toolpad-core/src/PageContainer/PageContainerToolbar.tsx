'use client';
import * as React from 'react';
import { styled } from '@mui/material';

const PageContainerToolbarRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(1),
  // Ensure the toolbar is always on the right side, even after wrapping
  marginLeft: 'auto',
}));

export interface PageContainerToolbarProps {
  children?: React.ReactNode;
}

/**
 *
 * Demos:
 *
 * - [Page Container](https://mui.com/toolpad/core/react-page-container/)
 *
 * API:
 *
 * - [PageContainerToolbar API](https://mui.com/toolpad/core/api/page-container-toolbar)
 */
function PageContainerToolbar(props: PageContainerToolbarProps) {
  return <PageContainerToolbarRoot {...props} />;
}

export { PageContainerToolbar };
