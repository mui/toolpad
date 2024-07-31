import * as React from 'react';
import Box from '@mui/material/Box';
import { Session, AppProvider, DashboardLayout } from '@toolpad/core';

export default function AccountWithDashboard() {
  const [session, setSession] = React.useState<Session | null>({
    user: {
      name: 'Bharat Kashyap',
      email: 'bharatkashyap@outlook.com',
      image: 'https://avatars.githubusercontent.com/u/19550456',
    },
  });
  const authentication = React.useMemo(() => {
    return {
      signIn: () => {
        setSession({
          user: {
            name: 'Bharat Kashyap',
            email: 'bharatkashyap@outlook.com',
            image: 'https://avatars.githubusercontent.com/u/19550456',
          },
        });
      },
      signOut: () => {
        setSession(null);
      },
    };
  }, []);

  return (
    <AppProvider session={session} authentication={authentication}>
      <DashboardLayout>
        <Box sx={{ px: 6, py: 2 }}>Dashboard content</Box>
      </DashboardLayout>
    </AppProvider>
  );
}
