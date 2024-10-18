import * as React from 'react';
import { Box, Stack, Typography, Avatar, Link, Divider } from '@mui/material';
import {
  AccountPreview,
  AccountPopoverFooter,
  SignOutButton,
} from '@toolpad/core/Account';

import { useSession } from '@toolpad/core/useSession';

export function UserOrg() {
  const session = useSession();
  if (!session?.user) {
    return <Typography>No user session available</Typography>;
  }

  const { logo: orgLogo, name: orgName, url: orgUrl } = session.org;

  return (
    <Stack>
      <AccountPreview variant="expanded" />
      {session.org && (
        <Stack mb={1}>
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
      <Divider />
      <AccountPopoverFooter>
        <SignOutButton />
      </AccountPopoverFooter>
    </Stack>
  );
}
