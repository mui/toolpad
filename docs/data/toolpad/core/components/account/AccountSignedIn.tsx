import * as React from 'react';
import { Account, AuthenticationContext, SessionContext } from '@toolpad/core';

export default function AccountSignedIn() {
  const session = React.useMemo(
    () => ({
      user: {
        name: 'Bharat Kashyap',
        email: 'bharatkashyap@outlook.com',
        username: 'bharatkashyap',
        image: 'https://avatars.githubusercontent.com/u/19550456',
      },
    }),
    [],
  );
  const authentication = React.useMemo(() => {
    return {
      signIn: () => {
        alert('Signing in!');
      },
      signOut: () => {},
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
