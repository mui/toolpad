import * as React from 'react';
import { asArray } from '@mui/toolpad-utils/collections';

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
    reason = `User with role(s) ${user?.roles
      ?.map((role) => JSON.stringify(role))
      .join(', ')} is not authorized to access this resource.`;
  }

  return reason ? <div>Unauthorized. {reason}</div> : children;
}
