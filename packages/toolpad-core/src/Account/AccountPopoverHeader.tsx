import * as React from 'react';
import PropTypes from 'prop-types';
import Stack, { StackProps } from '@mui/material/Stack';

export interface AccountPopoverHeaderProps extends StackProps {
  children?: React.ReactNode;
}

/**
 *
 * Demos:
 *
 * - [Account](https://mui.com/toolpad/core/react-account/)
 *
 * API:
 *
 * - [AccountPopoverHeader API](https://mui.com/toolpad/core/api/account-popover-header)
 */
function AccountPopoverHeader(props: AccountPopoverHeaderProps) {
  const { children, ...rest } = props;
  return <Stack {...rest}>{children}</Stack>;
}

AccountPopoverHeader.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component.
   */
  children: PropTypes.node,
} as any;

export { AccountPopoverHeader };
