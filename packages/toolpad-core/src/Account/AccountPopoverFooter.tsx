import * as React from 'react';
import Box, { BoxProps } from '@mui/material/Box';

export interface AccountPopoverFooterProps extends BoxProps {
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
 * - [AccountPopoverFooter API](https://mui.com/toolpad/core/api/account-popover-footer)
 */ function AccountPopoverFooter(props: AccountPopoverFooterProps) {
  const { children, ...rest } = props;
  return (
    <Box
      {...rest}
      sx={{ display: 'flex', flexDirection: 'row', p: 1, justifyContent: 'flex-end', ...rest.sx }}
    >
      {children}
    </Box>
  );
}
