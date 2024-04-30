import * as React from 'react';
import { createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import LayersIcon from '@mui/icons-material/Layers';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';

const baseTheme = createTheme();

const theme = createTheme(baseTheme, {
  palette: {
    background: {
      default: baseTheme.palette.grey['50'],
    },
  },
  typography: {
    h6: {
      fontWeight: '700',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderWidth: 0,
          borderBottomWidth: 1,
          borderStyle: 'solid',
          borderColor: baseTheme.palette.divider,
          boxShadow: 'none',
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: baseTheme.palette.primary.dark,
          padding: 8,
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          color: baseTheme.palette.grey['600'],
          fontSize: 12,
          fontWeight: '700',
          height: 40,
          paddingLeft: 32,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          paddingTop: 0,
          paddingBottom: 0,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            '& .MuiListItemIcon-root': {
              color: baseTheme.palette.primary.dark,
            },
            '& .MuiTypography-root': {
              color: baseTheme.palette.primary.dark,
            },
            '& .MuiSvgIcon-root': {
              color: baseTheme.palette.primary.dark,
            },
            '& .MuiTouchRipple-child': {
              backgroundColor: baseTheme.palette.primary.dark,
            },
          },
          '& .MuiSvgIcon-root': {
            color: baseTheme.palette.action.active,
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          '& .MuiTypography-root': {
            fontWeight: '500',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 34,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderBottomWidth: 2,
          marginLeft: '16px',
          marginRight: '16px',
        },
      },
    },
  },
});

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

export default function BasicDashboardLayout() {
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
