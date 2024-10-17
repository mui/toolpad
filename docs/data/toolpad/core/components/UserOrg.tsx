import * as React from 'react';
import { Box, Stack, Typography, Avatar, Link } from '@mui/material';
import { AccountDetails, Session, useSession } from '@toolpad/core';

export interface CustomSession extends Session {
  org: {
    name: string;
    url: string;
    logo: string;
  };
}

export function UserOrg() {
  const session = useSession<CustomSession>();
  if (!session?.user) {
    return <Typography>No user session available</Typography>;
  }

  const { logo: orgLogo, name: orgName, url: orgUrl } = session.org;

  return (
    <Box sx={{ p: 2 }}>
      <Stack>
        <AccountDetails />
        {session.org && (
          <Stack>
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
