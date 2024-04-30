import * as React from 'react';
import { createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
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
    title: 'Item 1',
    icon: <DescriptionIcon />,
  },
  {
    title: 'Item 2',
    icon: <DescriptionIcon />,
  },
  {
    title: 'Folder 1',
    icon: <FolderIcon />,
    children: [
      {
        title: 'Item A1',
        icon: <DescriptionIcon />,
      },
      {
        title: 'Item A2',
        icon: <DescriptionIcon />,
      },
      {
        title: 'Folder A1',
        icon: <FolderIcon />,
        children: [
          {
            title: 'Item B1',
            icon: <DescriptionIcon />,
          },
          {
            title: 'Item B2',
            icon: <DescriptionIcon />,
          },
        ],
      },
    ],
  },
  { kind: 'divider' },
  {
    kind: 'header',
    title: 'Header 1',
  },
  {
    title: 'Item A',
    icon: <DescriptionIcon />,
  },
  {
    kind: 'header',
    title: 'Header 2',
  },
  {
    title: 'Item B',
    icon: <DescriptionIcon />,
  },
  {
    title: 'Folder 3',
    icon: <FolderIcon />,
    children: [
      {
        kind: 'header',
        title: 'Header A1',
      },
      {
        title: 'Item C1',
        icon: <DescriptionIcon />,
      },
      {
        title: 'Item C2',
        icon: <DescriptionIcon />,
      },
      { kind: 'divider' },
      {
        kind: 'header',
        title: 'Header A2',
      },
      {
        title: 'Item C3',
        icon: <DescriptionIcon />,
      },
    ],
  },
];

export default function NavigationDashboardLayout() {
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
