import * as React from 'react';
import Typography from '@mui/material/Typography';
import { useSession } from 'next-auth/react';

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <main>
      <Typography>Welcome to Toolpad, {session?.user?.name || 'User'}!</Typography>
    </main>
  );
}

HomePage.requireAuth = true;
