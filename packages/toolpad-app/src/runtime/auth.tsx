import * as React from 'react';
import { asArray } from '@mui/toolpad-utils/collections';
import { Box } from '@mui/material';

export interface User {
  roles?: string[];
}

export interface AuthorizationProviderProps {
  children?: React.ReactNode;
  user?: User | null;
}

const UserContext = React.createContext<null | User>(null);

export function AuthenticationProvider({ children, user = null }: AuthorizationProviderProps) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export interface RequireAuthorizationProps {
  children?: React.ReactNode;
  allowedRole?: string | string[];
}

export function RequireAuthorization({ children, allowedRole }: RequireAuthorizationProps) {
  const user = React.useContext(UserContext);
  const allowedRolesSet = React.useMemo<Set<string>>(
    () => new Set(asArray(allowedRole ?? [])),
    [allowedRole],
  );

  let reason = null;
  if (!user) {
    reason = 'User is not authenticated.';
  } else if (!user.roles || user.roles.length <= 0) {
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
      }}
    >
      Unauthorized. {reason}
    </Box>
  ) : (
    children
  );
}
