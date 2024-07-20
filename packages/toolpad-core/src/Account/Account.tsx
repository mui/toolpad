import * as React from 'react';
import PropTypes from 'prop-types';
import { AvatarProps } from '@mui/material';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Button, { ButtonProps } from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LogoutIcon from '@mui/icons-material/Logout';
import { SessionContext, AuthenticationContext } from '../AppProvider/AppProvider';
import { SessionAvatar } from './SessionAvatar';

export interface AccountProps {
  /**
   * Props to pass to the constituent components in the Account component.
   * @default {}
   * @example { signInButton: { color: 'primary' }, signOutButton: { color: 'secondary' } }
   */
  slotProps?: {
    signInButton?: ButtonProps;
    iconButton?: IconButtonProps;
    avatar?: AvatarProps;
    signOutButton?: ButtonProps;
  };
  /**
   * The label for the sign in button.
   * @default 'Sign In'
   */
  signInLabel?: string;
  /**
   * The label for the sign out button.
   * @default 'Sign Out'
   */
  signOutLabel?: string;
}

/**
 *
 * Demos:
 *
 * - [Account](https://mui.com/toolpad/core/react-account/)
 * - [Dashboard Layout](https://mui.com/toolpad/core/react-dashboard-layout/)
 * - [Sign In Page](https://mui.com/toolpad/core/react-sign-in-page/)
 *
 * API:
 *
 * - [Account API](https://mui.com/toolpad/core/api/account)
 */
function Account({ slotProps, signInLabel = 'Sign In', signOutLabel = 'Sign Out' }: AccountProps) {
  const session = React.useContext(SessionContext);

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const popoverId = React.useId();
  const id = open ? popoverId : undefined;

  const authentication = React.useContext(AuthenticationContext);

  if (!authentication) {
    return null;
  }

  if (!session?.user) {
    return (
      <Button
        disableElevation
        variant="contained"
        color="inherit"
        size="small"
        {...slotProps?.signInButton}
        onClick={authentication.signIn}
        sx={{
          ...slotProps?.signInButton?.sx,
          textTransform: 'capitalize',
          filter: 'opacity(0.9)',
          transition: 'filter 0.2s ease-in',
          '&:hover': {
            filter: 'opacity(1)',
          },
        }}
      >
        {signInLabel}
      </Button>
    );
  }

  return (
    <React.Fragment>
      <IconButton
        aria-describedby={id}
        onClick={handleClick}
        aria-label="Current User"
        {...slotProps?.iconButton}
      >
        <SessionAvatar session={session} sx={{ width: 32, height: 32, ...slotProps?.avatar }} />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Stack sx={{ width: 350 }}>
          <Stack
            direction="row"
            sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}
            spacing={2}
          >
            <SessionAvatar session={session} sx={{ width: 48, height: 48 }} />
            <Stack>
              <Typography fontWeight="bolder">{session.user.name}</Typography>
              <Typography variant="caption">{session.user.email}</Typography>
            </Stack>
          </Stack>

          <Stack direction="row" sx={{ p: 1, justifyContent: 'right' }}>
            <Button
              disabled={!authentication}
              variant="contained"
              size="small"
              disableElevation
              color="inherit"
              startIcon={<LogoutIcon />}
              {...slotProps?.signOutButton}
              onClick={authentication?.signOut}
              sx={{
                ...slotProps?.signOutButton?.sx,
                textTransform: 'capitalize',
                filter: 'opacity(0.9)',
                transition: 'filter 0.2s ease-in',
                '&:hover': {
                  filter: 'opacity(1)',
                },
              }}
            >
              {signOutLabel || 'Sign Out'}
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </React.Fragment>
  );
}

Account.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The label for the sign in button.
   * @default 'Sign In'
   */
  signInLabel: PropTypes.string,
  /**
   * The label for the sign out button.
   * @default 'Sign Out'
   */
  signOutLabel: PropTypes.string,
  /**
   * Props to pass to the constituent components in the Account component.
   * @default {}
   * @example { signInButton: { color: 'primary' }, signOutButton: { color: 'secondary' } }
   */
  slotProps: PropTypes.shape({
    avatar: PropTypes.object,
    iconButton: PropTypes.object,
    signInButton: PropTypes.object,
    signOutButton: PropTypes.object,
  }),
} as any;

export { Account };
