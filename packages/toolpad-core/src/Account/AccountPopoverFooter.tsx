import * as React from 'react';
import PropTypes from 'prop-types';
import Box, { BoxProps } from '@mui/material/Box';

export interface AccountPopoverFooterProps extends BoxProps {
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
 * - [AccountPopoverFooter API](https://mui.com/toolpad/core/api/account-popover-footer)
 */
function AccountPopoverFooter(props: AccountPopoverFooterProps) {
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

AccountPopoverFooter.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * @ignore
   */
  children: PropTypes.node,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
} as any;

export { AccountPopoverFooter };
