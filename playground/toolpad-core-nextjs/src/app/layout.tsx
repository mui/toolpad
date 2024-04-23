import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import type { Navigation } from '@toolpad/core';
import theme from './theme';

const NAVIGATION: Navigation = [
  {
    title: 'Primary items',
    items: [
      {
        label: 'Dashboard1',
        path: '/dashboard',
        icon: <DashboardIcon />,
      },
      {
        label: 'Orders1',
        icon: <ShoppingCartIcon />,
        items: [
          {
            label: 'Nested Orders 1',
            path: '/dashboard/orders1/nested1',
            icon: <ShoppingCartIcon />,
          },
          {
            label: 'Nested Orders 2',
            path: '/dashboard/orders1/nested2',
            icon: <ShoppingCartIcon />,
          },
        ],
      },
    ],
  },
  {
    title: 'Secondary items',
    items: [
      {
        label: 'Dashboard 2',
        path: '/dashboard2',
        icon: <DashboardIcon />,
      },
      {
        label: 'Orders2',
        path: '/dashboard/orders2',
        icon: <ShoppingCartIcon />,
      },
    ],
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
