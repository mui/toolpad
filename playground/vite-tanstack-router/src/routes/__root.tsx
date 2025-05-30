import * as React from 'react';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
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
    segment: 'orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
    pattern: 'orders{/:orderId}*',
  },
];

const BRANDING = {
  title: 'My Toolpad Core App',
};

function App() {
  return (
    <TanStackRouterAppProvider navigation={NAVIGATION} branding={BRANDING}>
      <Outlet />
      <TanStackRouterDevtools />
    </TanStackRouterAppProvider>
  );
}

export const Route = createRootRoute({
  component: App,
});
