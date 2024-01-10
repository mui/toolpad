import * as React from 'react';
import { asArray } from '@mui/toolpad-utils/collections';
import { Box, CircularProgress, Container } from '@mui/material';
import { AUTH_SIGNIN_PATH, AuthContext } from './useAuth';

export interface RequireAuthorizationProps {
  children?: React.ReactNode;
  allowedRole?: string | string[];
  basename: string;
}

export function RequireAuthorization({
  children,
  allowedRole,
  basename,
}: RequireAuthorizationProps) {
  const { session, isSigningIn } = React.useContext(AuthContext);
  const user = session?.user ?? null;

  const allowedRolesSet = React.useMemo<Set<string>>(
    () => new Set(asArray(allowedRole ?? [])),
    [allowedRole],
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
  if (!user.roles || user.roles.length <= 0) {
    reason = 'User has no roles defined.';
  } else if (!user.roles.some((role) => allowedRolesSet.has(role))) {
    const rolesList = user?.roles?.map((role) => JSON.stringify(role)).join(', ');
    reason = `User with role(s) ${rolesList} is not allowed access to this resource.`;
  }

  // @TODO: Once we have roles we can add back this check.
  const skipReason = true;
  return !skipReason && reason ? (
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
