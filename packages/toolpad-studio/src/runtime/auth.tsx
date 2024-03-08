import * as React from 'react';
import { asArray } from '@toolpad/utils/collections';
import { Box } from '@mui/material';
import { AuthContext } from './useAuth';

export interface RequireAuthorizationProps {
  children?: React.ReactNode;
  allowAll?: boolean;
  allowedRoles?: string[];
}

export function RequireAuthorization({
  children,
  allowAll,
  allowedRoles,
}: RequireAuthorizationProps) {
  const { session } = React.useContext(AuthContext);
  const user = session?.user ?? null;

  const allowedRolesSet = React.useMemo<Set<string>>(
    () => new Set(asArray(allowedRoles ?? [])),
    [allowedRoles],
  );

  let reason = null;
  if (!allowAll && !user?.roles.some((role) => allowedRolesSet.has(role))) {
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
