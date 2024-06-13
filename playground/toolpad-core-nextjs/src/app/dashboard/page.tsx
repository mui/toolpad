import * as React from 'react';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import UserAvatar from '../../components/UserAvatar';
import { auth } from '../../auth';

export default async function Dashboard() {
  const session = await auth();

  return (
    <Box
      sx={{
        my: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <UserAvatar />
      <Typography variant="h4" component="h1" sx={{ my: 3 }}>
        Welcome to the Toolpad dashboard, {session?.user?.name || 'user'}
      </Typography>
      <Button
        component="a"
        href="/signout"
        variant="contained"
        disableElevation
        sx={{
          textTransform: 'capitalize',
          backgroundColor: '#29242e',
          filter: 'opacity(0.9)',
          transition: 'filter 0.2s ease-in',
          '&:hover': { backgroundColor: '#29242e', filter: 'opacity(1)' },
        }}
      >
        Sign out
      </Button>
    </Box>
  );
}
