import * as React from 'react';
import { AppProvider, DashboardLayout } from '@toolpad/core';

export default function AccountWithDashboard() {
  const [session, setSession] = React.useState({
    user: {
      name: 'Bharat Kashyap',
      email: 'bharatkashyap@outlook.com',
      image: 'https://avatars.githubusercontent.com/u/19550456',
    },
  });
  const authentication = React.useMemo(() => {
    return {
      signIn: () => {
        alert('Signing in!');
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
        <p>Content</p>
      </DashboardLayout>
    </AppProvider>
  );
}
