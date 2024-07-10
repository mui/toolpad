import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { AppProvider, Router } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import type { Navigation, Branding } from '@toolpad/core';

const NAVIGATION: Navigation = [
  {
    slug: '/dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    slug: '/orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
  },
];

const BRANDING: Branding = {
  logo: <img src="https://mui.com/static/logo.png" alt="MUI logo" />,
  title: 'MUI',
};

export default function DashboardLayoutBranding() {
  const [pathname, setPathname] = React.useState('/page');

  const router = React.useMemo<Router>(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    };
  }, [pathname]);

  return (
    <AppProvider navigation={NAVIGATION} branding={BRANDING} router={router}>
      <DashboardLayout>
        <Box
          sx={{
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography>Dashboard content for {pathname}</Typography>
        </Box>
      </DashboardLayout>
    </AppProvider>
  );
}
