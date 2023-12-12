import * as React from 'react';
import { asArray } from '@mui/toolpad-utils/collections';
import { Box, CircularProgress, Stack } from '@mui/material';
import { AuthSessionContext } from './useAuthSession';

export interface RequireAuthorizationProps {
  children?: React.ReactNode;
  allowedRole?: string | string[];
}

export function RequireAuthorization({ children, allowedRole }: RequireAuthorizationProps) {
  const { session, isSigningIn } = React.useContext(AuthSessionContext);
  const user = session?.user ?? null;

  const allowedRolesSet = React.useMemo<Set<string>>(
    () => new Set(asArray(allowedRole ?? [])),
    [allowedRole],
  );

  let reason = null;
  if (!user) {
    if (!isSigningIn) {
      window.location.replace('/api/auth/signin');
    }

    return (
      <Stack direction="column" alignItems="center" mt={2}>
        <CircularProgress color="primary" size={56} />
      </Stack>
    );
  }
  if (!user.roles || user.roles.length <= 0) {
    reason = 'User has no roles defined.';
  } else if (!user.roles.some((role) => allowedRolesSet.has(role))) {
    const rolesList = user?.roles?.map((role) => JSON.stringify(role)).join(', ');
    reason = `User with role(s) ${rolesList} is not allowed access to this resource.`;
  }

  return reason ? (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mt: 2,
      }}
    >
      Unauthorized. {reason}
    </Box>
  ) : (
    children
  );
}
