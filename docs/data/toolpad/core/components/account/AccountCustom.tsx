import * as React from 'react';
import Typography from '@mui/material/Typography';
import {
  AuthenticationContext,
  SessionContext,
  type Session,
} from '@toolpad/core/AppProvider';
import { Account } from '@toolpad/core/Account';

const demoSession = {
  user: {
    name: 'Bharat Kashyap',
    email: 'bharatkashyap@outlook.com',
    image: 'https://avatars.githubusercontent.com/u/19550456',
  },
};

export default function AccountCustom() {
  const [session, setSession] = React.useState<Session | null>(demoSession);
  const [signedOutSession, setSignedOutSession] = React.useState<Session | null>(
    null,
  );

  const authenticationSignedIn = React.useMemo(() => {
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
        setSignedOutSession(null);
      },
    };
  }, []);

  const authenticationSignedOut = React.useMemo(() => {
    return {
      signIn: () => {
        setSignedOutSession(demoSession);
      },
      signOut: () => {
        setSignedOutSession(null);
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
      <AuthenticationContext.Provider value={authenticationSignedIn}>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', fontStyle: 'italic', margin: 'auto' }}
        >
          Signed in
        </Typography>
        <SessionContext.Provider value={session}>
          <Account
            localeText={{
              signInLabel: 'Login',
              signOutLabel: 'Logout',
            }}
            slotProps={{
              signOutButton: {
                color: 'info',
                variant: 'outlined',
                sx: {
                  color: 'primaryDark',
                  textTransform: 'capitalize',
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
          />
        </SessionContext.Provider>

        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', fontStyle: 'italic', margin: 'auto' }}
        >
          Signed out
        </Typography>
      </AuthenticationContext.Provider>
      <AuthenticationContext.Provider value={authenticationSignedOut}>
        <SessionContext.Provider value={signedOutSession}>
          {/* preview-start */}
          <Account
            localeText={{
              signInLabel: 'Login',
              signOutLabel: 'Logout',
            }}
            slotProps={{
              signInButton: {
                color: 'info',
                variant: 'outlined',
                sx: {
                  margin: 'auto',
                  color: 'primaryDark',
                  textTransform: 'capitalize',
                  fontFamily: 'Inter',
                  fontSize: '1em',
                  height: 'fit-content',
                  maxHeight: 'max-content',
                },
              },
              signOutButton: { color: 'primary', variant: 'outlined' },
            }}
          />
          {/* preview-end */}
        </SessionContext.Provider>
      </AuthenticationContext.Provider>
    </div>
  );
}
