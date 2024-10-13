import * as React from 'react';
import { Account, AuthenticationContext, SessionContext } from '@toolpad/core';

import { UserOrg } from '../UserOrg';

const demoSession = {
  user: {
    name: 'Bharat Kashyap',
    email: 'bharat@mui.com',
    image: 'https://avatars.githubusercontent.com/u/19550456',
  },
  org: {
    name: 'MUI Inc.',
    url: 'https://mui.com',
    logo: 'https://mui.com/static/logo.svg',
  },
};

export default function AccountCustomUserDetails() {
  const [customSession, setCustomSession] = React.useState(demoSession);
  const authentication = React.useMemo(() => {
    return {
      signIn: () => {
        setCustomSession(demoSession);
      },
      signOut: () => {
        setCustomSession(null);
      },
    };
  }, []);

  return (
    <AuthenticationContext.Provider value={authentication}>
      <SessionContext.Provider value={customSession}>
        {/* preview-start */}
        <Account
          slots={{
            content: UserOrg,
          }}
        />
        {/* preview-end */}
      </SessionContext.Provider>
    </AuthenticationContext.Provider>
  );
}
