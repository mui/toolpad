import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import UserAvatar from '../../components/UserAvatar';
import SignOut from '../../components/SignOut';
import { auth } from '../../auth';

export default async function HomePage() {
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
      <Typography variant="h4" component="h1" sx={{ my: 2 }}>
        Welcome to Toolpad, {session?.user?.name || 'User'}!
      </Typography>
      <SignOut />
    </Box>
  );
}
