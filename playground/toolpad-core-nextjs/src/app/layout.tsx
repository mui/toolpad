import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import type { Navigation } from '@toolpad/core';
import theme from './theme';

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    path: '/dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    path: '/dashboard/orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
  },
];

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider theme={theme} navigation={NAVIGATION}>
          {props.children}
        </AppProvider>
      </body>
    </html>
  );
}
