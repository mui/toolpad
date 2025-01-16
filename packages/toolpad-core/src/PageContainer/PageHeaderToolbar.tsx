'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material';

const PageHeaderToolbarRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(1),
  // Ensure the toolbar is always on the right side, even after wrapping
  marginLeft: 'auto',
}));

export interface PageHeaderToolbarProps {
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
 * - [PageHeaderToolbar API](https://mui.com/toolpad/core/api/page-header-toolbar)
 */
function PageHeaderToolbar(props: PageHeaderToolbarProps) {
  return <PageHeaderToolbarRoot {...props} />;
}

PageHeaderToolbar.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * @ignore
   */
  children: PropTypes.node,
} as any;

export { PageHeaderToolbar };
