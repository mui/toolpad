import * as React from 'react';
import { Account, AuthenticationContext, SessionContext } from '@toolpad/core';

export default function AccountDemo() {
  const [session, setSession] = React.useState(null);
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
    <AuthenticationContext.Provider value={authentication}>
      <SessionContext.Provider value={session}>
        <Account />
      </SessionContext.Provider>
    </AuthenticationContext.Provider>
  );
}
