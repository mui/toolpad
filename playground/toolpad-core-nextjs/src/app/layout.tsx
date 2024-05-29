import * as React from 'react';
import { AppProvider, Navigation } from '@toolpad/core/AppProvider';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    slug: '/dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    slug: '/dashboard/orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
  },
];

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider navigation={NAVIGATION}>{props.children}</AppProvider>
      </body>
    </html>
  );
}
