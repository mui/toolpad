import * as React from 'react';
import { Box, Stack, Typography, Avatar, Link } from '@mui/material';
import {
  Account,
  AuthenticationContext,
  SessionContext,
  AccountDetails,
  useSession,
} from '@toolpad/core';

const demoSession = {
  user: {
    name: 'Bharat Kashyap',
    email: 'bharat@mui.com',
    image: 'https://avatars.githubusercontent.com/u/19550456',
  },
  org: {
    name: 'MUI Inc.',
    url: 'https://mui.com',
    logo: 'https://mui.com/static/logo.svg',
  },
};

function UserDetails() {
  const session = useSession();
  if (!session?.user) {
    return <Typography>No user session available</Typography>;
  }

  const { logo: orgLogo, name: orgName, url: orgUrl } = session.org;

  return (
    <Box sx={{ p: 2 }}>
      <Stack>
        <AccountDetails />
        {session.org && (
          <Stack mt={1}>
            <Typography textAlign="center" fontSize="0.625rem" gutterBottom>
              This account is managed by
            </Typography>
            <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
              <Avatar
                variant="square"
                src={orgLogo}
                alt={orgName}
                sx={{ width: 27, height: 24 }}
              />
              <Stack>
                <Typography variant="caption" fontWeight="bolder">
                  {orgName}
                </Typography>
                <Link
                  variant="caption"
                  href={orgUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {orgUrl}
                </Link>
              </Stack>
            </Box>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

export default function AccountCustomUserDetails() {
  const [customSession, setCustomSession] = React.useState(demoSession);
  const authentication = React.useMemo(() => {
    return {
      signIn: () => {
        setCustomSession(demoSession);
      },
      signOut: () => {
        setCustomSession(null);
      },
    };
  }, []);

  return (
    <AuthenticationContext.Provider value={authentication}>
      {/* preview-start */}
      <SessionContext.Provider value={customSession}>
        <Account
          slots={{
            content: UserDetails,
          }}
        />
      </SessionContext.Provider>
      {/* preview-end */}
    </AuthenticationContext.Provider>
  );
}