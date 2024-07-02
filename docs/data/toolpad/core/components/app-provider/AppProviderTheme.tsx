import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { experimental_extendTheme as extendTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TimelineIcon from '@mui/icons-material/Timeline';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import type { Navigation, Router } from '@toolpad/core';

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    slug: '/page',
    title: 'Page',
    icon: <DashboardIcon />,
  },
  {
    slug: '/page-2',
    title: 'Page 2',
    icon: <TimelineIcon />,
  },
];

const customTheme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        background: {
          default: 'var(--mui-palette-grey-50)',
          defaultChannel: 'var(--mui-palette-grey-50)',
        },
      },
    },
    dark: {
      palette: {
        background: {
          default: 'var(--mui-palette-grey-900)',
          defaultChannel: 'var(--mui-palette-grey-900)',
        },
        text: {
          primary: 'var(--mui-palette-grey-200)',
          primaryChannel: 'var(--mui-palette-grey-200)',
        },
      },
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
        root: ({ theme }) => ({
          backgroundColor: theme.vars.palette.background.paper,
          borderWidth: 0,
          borderBottomWidth: 1,
          borderStyle: 'solid',
          borderColor: theme.vars.palette.divider,
          boxShadow: 'none',
        }),
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          backgroundColor: 'inherit',
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
        root: ({ theme }) => ({
          color: theme.vars.palette.primary.dark,
          padding: 8,
        }),
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.vars.palette.grey['600'],
          fontSize: 12,
          fontWeight: '700',
          height: 40,
          paddingLeft: 32,
          [theme.getColorSchemeSelector('dark')]: {
            color: theme.vars.palette.grey['500'],
          },
        }),
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
        root: ({ theme }) => ({
          borderRadius: 8,
          '&.Mui-selected': {
            '& .MuiListItemIcon-root': {
              color: theme.vars.palette.primary.dark,
            },
            '& .MuiTypography-root': {
              color: theme.vars.palette.primary.dark,
            },
            '& .MuiSvgIcon-root': {
              color: theme.vars.palette.primary.dark,
            },
            '& .MuiTouchRipple-child': {
              backgroundColor: theme.vars.palette.primary.dark,
            },
          },
          '& .MuiSvgIcon-root': {
            color: theme.vars.palette.action.active,
          },
        }),
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

export default function AppProviderTheme() {
  const [pathname, setPathname] = React.useState('/page');

  const router = React.useMemo<Router>(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    };
  }, [pathname]);

  return (
    // preview-start
    <AppProvider navigation={NAVIGATION} router={router} theme={customTheme}>
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
    // preview-end
  );
}
