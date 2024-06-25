import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Avatar, { AvatarProps } from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LogoutIcon from '@mui/icons-material/Logout';
import { Session, SessionContext, AutheticationContext } from '../AppProvider/AppProvider';

interface SessionAvatarProps extends AvatarProps {
  session: Session;
}

function SessionAvatar({ session, ...props }: SessionAvatarProps) {
  return (
    <Avatar
      src={session.user?.image || ''}
      alt={session.user?.name || session.user?.email || ''}
      {...props}
    />
  );
}

export function User() {
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

  const authentication = React.useContext(AutheticationContext);

  if (!session?.user) {
    return null;
  }

  return (
    <React.Fragment>
      <IconButton aria-describedby={id} onClick={handleClick}>
        <SessionAvatar session={session} sx={{ width: 32, height: 32 }} />
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
              variant="outlined"
              size="small"
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={authentication?.signOut}
            >
              Sign out
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </React.Fragment>
  );
}
