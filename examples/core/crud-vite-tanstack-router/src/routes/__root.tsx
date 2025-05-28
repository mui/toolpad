import * as React from 'react';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import { TanStackRouterAppProvider } from '@toolpad/core/tanstack-router';
import type { Navigation } from '@toolpad/core/AppProvider';

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
    segment: 'employees',
    title: 'Employees',
    icon: <PersonIcon />,
    pattern: 'employees{/:employeeId}*',
  },
];

const BRANDING = {
  title: 'My Toolpad Core App',
};

function App() {
  return (
    <TanStackRouterAppProvider navigation={NAVIGATION} branding={BRANDING}>
      <Outlet />
    </TanStackRouterAppProvider>
  );
}

export const Route = createRootRoute({
  component: App,
});
