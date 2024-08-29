import * as React from 'react';
import Typography from '@mui/material/Typography';
import {
  Account,
  AuthenticationContext,
  SessionContext,
  Session,
} from '@toolpad/core';

const demoSession = {
  user: {
    name: 'Bharat Kashyap',
    email: 'bharatkashyap@outlook.com',
    image: 'https://avatars.githubusercontent.com/u/19550456',
  },
};

export default function AccountCustom() {
  const [session, setSession] = React.useState<Session | null>(demoSession);
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
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        rowGap: '2rem',
        columnGap: '2rem',
      }}
    >
      <AuthenticationContext.Provider value={authentication}>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', fontStyle: 'italic', margin: 'auto' }}
        >
          Signed in
        </Typography>
        <SessionContext.Provider value={session}>
          {/* preview-start */}
          <Account
            slotProps={{
              signOutButton: {
                color: 'info',
                variant: 'outlined',
                sx: {
                  color: 'primaryDark',
                  fontFamily: 'Inter',
                  fontSize: '1em',
                },
              },
              iconButton: {
                sx: {
                  width: 'fit-content',
                  margin: 'auto',
                },
              },
            }}
            signInLabel="Login"
            signOutLabel="Logout"
          />
          {/* preview-end */}
        </SessionContext.Provider>

        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', fontStyle: 'italic', margin: 'auto' }}
        >
          Signed out
        </Typography>
        <SessionContext.Provider value={null}>
          <Account
            slotProps={{
              signInButton: {
                color: 'info',
                variant: 'outlined',
                sx: {
                  margin: 'auto',
                  color: 'primaryDark',
                  fontFamily: 'Inter',
                  fontSize: '1em',
                  height: 'fit-content',
                  maxHeight: 'max-content',
                },
              },
              signOutButton: { color: 'primary', variant: 'outlined' },
            }}
            signInLabel="Login"
            signOutLabel="Logout"
          />
        </SessionContext.Provider>
      </AuthenticationContext.Provider>
    </div>
  );
}
