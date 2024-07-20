import * as React from 'react';
import { Account, AuthenticationContext, SessionContext } from '@toolpad/core';

export default function AccountSignedOut() {
  const session = React.useMemo(() => null, []);
  const authentication = React.useMemo(() => {
    return {
      signIn: () => {},
      signOut: () => {
        alert('Signing out!');
      },
    };
  }, []);

  return (
    <AuthenticationContext.Provider value={authentication}>
      <SessionContext.Provider value={session}>
        <Account />
      </SessionContext.Provider>
    </AuthenticationContext.Provider>
  );
}
