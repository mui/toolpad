import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import LayersIcon from '@mui/icons-material/Layers';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import theme from '../theme';

const NAVIGATION = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    title: 'Orders',
    icon: <ShoppingCartIcon />,
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Analytics',
  },
  {
    title: 'Reports',
    icon: <BarChartIcon />,
    children: [
      {
        title: 'Sales',
        icon: <DescriptionIcon />,
      },
      {
        title: 'Traffic',
        icon: <DescriptionIcon />,
      },
    ],
  },
  {
    title: 'Integrations',
    icon: <LayersIcon />,
  },
];

export default function DashboardLayoutBasic() {
  return (
    <AppProvider theme={theme} navigation={NAVIGATION}>
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
