import * as React from 'react';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import Button, { ButtonProps } from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Logout from '@mui/icons-material/Logout';

import { Typography } from '@mui/material';
import { SessionAvatar } from './SessionAvatar';
import { SessionContext, AuthenticationContext } from '../AppProvider/AppProvider';

interface AccountProps {
  /**
   * The components used for each slot inside.
   */
  slots?: {
    /**
     * The component used for the sign in button.
     */
    signInButton?: React.ComponentType<ButtonProps>;
    /**
     * The component used for the sign out button.
     */
    signOutButton?: React.ComponentType<ButtonProps>;
  };
  /**
   * The props used for each slot inside.
   */
  slotProps?: {
    signInButton?: ButtonProps;
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

function Account(props: AccountProps) {
  const { slots, slotProps, signInLabel = 'Sign In', signOutLabel = 'Sign Out' } = props;
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const session = React.useContext(SessionContext);
  const authentication = React.useContext(AuthenticationContext);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  if (!authentication) {
    return null;
  }

  if (!session?.user) {
    return slots?.signInButton ? (
      <slots.signInButton onClick={authentication.signIn} />
    ) : (
      <Button
        disableElevation
        variant="contained"
        color="inherit"
        size="small"
        onClick={authentication.signIn}
        sx={{
          textTransform: 'capitalize',
          filter: 'opacity(0.9)',
          transition: 'filter 0.2s ease-in',
          '&:hover': {
            filter: 'opacity(1)',
          },
        }}
        {...slotProps?.signInButton}
      >
        {signInLabel}
      </Button>
    );
  }
  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <Tooltip title="Account">
          <IconButton
            onClick={handleClick}
            size="small"
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <SessionAvatar session={session} sx={{ width: 32, height: 32 }} />
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1,
              // Attach a caret to the dropdown menu
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuList dense disablePadding>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 2,
              gap: 4,
            }}
          >
            <SessionAvatar session={session} sx={{ height: 48, width: 48 }} />
            <div>
              <Typography fontWeight="bolder">{session.user.name}</Typography>
              <Typography variant="caption">{session.user.email}</Typography>
            </div>
          </Box>
          <Divider />
          {slots?.signOutButton ? (
            <slots.signOutButton onClick={authentication?.signOut} />
          ) : (
            <MenuItem
              onClick={authentication?.signOut}
              sx={{ justifyContent: 'center', mt: 1 }}
              {...slotProps?.signOutButton}
            >
              <ListItemIcon>
                <Logout fontSize="inherit" />
              </ListItemIcon>
              {signOutLabel}
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    </React.Fragment>
  );
}

export { Account };
