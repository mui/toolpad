import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import type { Navigation, Branding } from '@toolpad/core';

const NAVIGATION: Navigation = [
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    title: 'Orders',
    icon: <ShoppingCartIcon />,
  },
];

const BRANDING: Branding = {
  logo: <img src="https://mui.com/static/logo.png" alt="MUI logo" />,
  title: 'MUI',
};

export default function DashboardLayoutBranding() {
  return (
    <AppProvider navigation={NAVIGATION} branding={BRANDING}>
      <DashboardLayout>
        <Box
          sx={{
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography>Dashboard content goes here.</Typography>
        </Box>
      </DashboardLayout>
    </AppProvider>
  );
}
