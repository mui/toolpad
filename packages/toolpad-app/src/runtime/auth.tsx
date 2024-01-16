import * as React from 'react';
import { asArray } from '@mui/toolpad-utils/collections';
import { Box, CircularProgress, Container } from '@mui/material';
import { AUTH_SIGNIN_PATH, AuthContext } from './useAuth';

export interface RequireAuthorizationProps {
  children?: React.ReactNode;
  allowAll?: boolean;
  allowedRoles?: string[];
  basename: string;
}

export function RequireAuthorization({
  children,
  allowAll,
  allowedRoles,
  basename,
}: RequireAuthorizationProps) {
  const { session, isSigningIn } = React.useContext(AuthContext);
  const user = session?.user ?? null;

  const allowedRolesSet = React.useMemo<Set<string>>(
    () => new Set(asArray(allowedRoles ?? [])),
    [allowedRoles],
  );

  React.useEffect(() => {
    if (!user && !isSigningIn) {
      window.location.replace(`${basename}${AUTH_SIGNIN_PATH}`);
    }
  }, [basename, isSigningIn, user]);

  if (!user) {
    return (
      <Container
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          mt: 4,
        }}
      >
        <CircularProgress color="primary" size={56} />
      </Container>
    );
  }

  let reason = null;
  if (!allowAll && !user.roles.some((role) => allowedRolesSet.has(role))) {
    reason = `User does not have the roles to access this page.`;
  }

  return reason ? (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mt: 6,
      }}
    >
      Unauthorized. {reason}
    </Box>
  ) : (
    children
  );
}
