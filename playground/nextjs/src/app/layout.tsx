import * as React from 'react';
import { AppProvider } from '@toolpad/core/nextjs';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import type { Navigation } from '@toolpad/core';

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    slug: '/',
    title: 'Dashboard',
    icon: <DashboardIcon />,
    badge: {
      content: 2,
    },
  },
  {
    slug: '/orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
    badge: {
      content: 'longlongligbg',
      color: 'error',
    },
    children: [
      {
        slug: '/nested',
        title: 'Nested orders',
        icon: <ShoppingCartIcon />,
        badge: {
          content: '12',
          color: 'success',
        },
      },
    ],
  },
];

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <AppProvider navigation={NAVIGATION}>{props.children}</AppProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
