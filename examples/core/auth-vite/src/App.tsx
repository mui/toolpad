import * as React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import { Outlet, useNavigate } from 'react-router';
import type { Navigation, Session } from '@toolpad/core/AppProvider';
import { SessionContext } from './SessionContext';

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
  },
];

const BRANDING = {
  title: 'My Toolpad Core App',
};

export default function App() {
  const [session, setSession] = React.useState<Session | null>(null);
  const navigate = useNavigate();

  const signIn = React.useCallback(() => {
    navigate('/sign-in');
  }, [navigate]);

  const signOut = React.useCallback(() => {
    setSession(null);
    navigate('/sign-in');
  }, [navigate]);

  const sessionContextValue = React.useMemo(() => ({ session, setSession }), [session, setSession]);

  return (
    <SessionContext.Provider value={sessionContextValue}>
      <ReactRouterAppProvider
        navigation={NAVIGATION}
        branding={BRANDING}
        session={session}
        authentication={{ signIn, signOut }}
      >
        <Outlet />
      </ReactRouterAppProvider>
    </SessionContext.Provider>
  );
}
