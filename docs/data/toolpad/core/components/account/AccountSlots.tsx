import * as React from 'react';
import {
  AuthenticationContext,
  SessionContext,
  type Session,
} from '@toolpad/core/AppProvider';
import { Account } from '@toolpad/core/Account';
import CustomMenuItems from './CustomMenu';

const demoSession = {
  user: {
    name: 'Bharat Kashyap',
    email: 'bharatkashyap@outlook.com',
    image: 'https://avatars.githubusercontent.com/u/19550456',
  },
};

export default function AccountSlots() {
  const [session, setSession] = React.useState<Session | null>(demoSession);
  const authentication = React.useMemo(() => {
    return {
      signIn: () => {
        setSession(demoSession);
      },
      signOut: () => {
        setSession(null);
      },
    };
  }, []);

  return (
    <AuthenticationContext.Provider value={authentication}>
      <SessionContext.Provider value={session}>
        <Account
          slots={{
            menuItems: CustomMenuItems,
          }}
        />
      </SessionContext.Provider>
    </AuthenticationContext.Provider>
  );
}
