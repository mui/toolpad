import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useSession } from 'next-auth/react';

export default function HomePage() {
  const { data: session } = useSession();
  return (
    <Box
      sx={{
        my: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Welcome to Toolpad{session ? `, ${session.user?.name}!` : ''}
      </Typography>
    </Box>
  );
}
