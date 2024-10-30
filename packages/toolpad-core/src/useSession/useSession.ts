import * as React from 'react';
import { SessionContext, Session } from '../AppProvider';

/**
 * Hook to access the current Toolpad Core session.
 * @returns The current session object or null if no session is available.
 */
export function useSession<T extends Session = Session>(): T | null {
  const session = React.useContext(SessionContext);
  return session as T | null;
}
