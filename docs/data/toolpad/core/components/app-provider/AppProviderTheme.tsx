import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { extendTheme } from '@mui/material/styles';
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
          default: '#E2FAFF',
          paper: '#D9FAFF',
        },
      },
    },
    dark: {
      palette: {
        background: {
          default: '#2A4364',
          paper: '#112E4D',
        },
      },
    },
  },
});

function DemoPageContent({ pathname }: { pathname: string }) {
  return (
    <Box
      sx={{
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Typography>Dashboard content for {pathname}</Typography>
    </Box>
  );
}

interface DemoProps {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window?: () => Window;
}

export default function AppProviderTheme(props: DemoProps) {
  const { window } = props;

  const [pathname, setPathname] = React.useState('/page');

  const router = React.useMemo<Router>(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    };
  }, [pathname]);

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  return (
    // preview-start
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={customTheme}
      window={demoWindow}
    >
      <DashboardLayout>
        <DemoPageContent pathname={pathname} />
      </DashboardLayout>
    </AppProvider>
    // preview-end
  );
}
