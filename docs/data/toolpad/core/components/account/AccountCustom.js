import * as React from 'react';
import { Account, AuthenticationContext, SessionContext } from '@toolpad/core';

export default function AccountCustom() {
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
    // preview-start
    <AuthenticationContext.Provider value={authentication}>
      <SessionContext.Provider value={session}>
        <Account
          slotProps={{
            signInButton: {
              color: 'info',
              variant: 'outlined',
              sx: {
                color: 'primaryDark',
                fontFamily: 'Inter',
                fontSize: '1em',
                textTransform: 'capitalize',
              },
            },
            signOutButton: {
              color: 'primary',
              variant: 'outlined',
            },
          }}
          signInLabel="Login"
          signOutLabel="Logout"
        />
      </SessionContext.Provider>
    </AuthenticationContext.Provider>
    // preview-end
  );
}
