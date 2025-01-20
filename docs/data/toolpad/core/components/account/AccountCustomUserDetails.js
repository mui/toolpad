import * as React from 'react';
import { Account } from '@toolpad/core/Account';
import { AppProvider } from '@toolpad/core/AppProvider';
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
    <AppProvider authentication={authentication} session={customSession}>
      {/* preview-start */}
      <Account
        slots={{
          popoverContent: UserOrg,
        }}
      />
      {/* preview-end */}
    </AppProvider>
  );
}
