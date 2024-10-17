import * as React from 'react';
import Stack, { StackProps } from '@mui/material/Stack';

export interface AccountPopoverHeaderProps extends StackProps {
  children?: React.ReactNode;
}

export /**
 *
 * Demos:
 *
 * - [Account](https://mui.com/toolpad/core/react-account/)
 *
 * API:
 *
 * - [AccountPopoverHeader API](https://mui.com/toolpad/core/api/account-popover-header)
 */ function AccountPopoverHeader(props: AccountPopoverHeaderProps) {
  const { children, ...rest } = props;
  return <Stack {...rest}>{children}</Stack>;
}
