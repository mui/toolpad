import * as React from 'react';
import Typography from '@mui/material/Typography';
import { auth } from '../../auth';

export default async function HomePage() {
  const session = await auth();

  return (
    <div>
      <Typography variant="h4" component="h1" sx={{ m: 2 }}>
        Welcome to Toolpad, {session?.user?.name || 'User'}!
      </Typography>
    </div>
  );
}
