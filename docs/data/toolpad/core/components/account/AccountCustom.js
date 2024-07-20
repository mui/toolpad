import * as React from 'react';
import { Account, AuthenticationContext, SessionContext } from '@toolpad/core';

export default function AccountCustom() {
  const [session, setSession] = React.useState(null);
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
    // preview-start
    <AuthenticationContext.Provider value={authentication}>
      <SessionContext.Provider value={session}>
        <Account
          slotProps={{
            iconButton: { color: 'primary' },
            signOutButton: { color: 'secondary' },
          }}
          signOutLabel="Logout"
        />
      </SessionContext.Provider>
    </AuthenticationContext.Provider>
    // preview-end
  );
}
