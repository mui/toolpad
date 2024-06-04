import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TimelineIcon from '@mui/icons-material/Timeline';
import { AppProvider, Navigation, Router } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';

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
  // Add the following new item:
  {
    slug: '/page-2',
    title: 'Page 2',
    icon: <TimelineIcon />,
  },
];

export default function TutorialPages() {
  const [pathname, setPathname] = React.useState('/page');

  const router = React.useMemo<Router>(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    };
  }, [pathname]);

  return (
    <AppProvider router={router} navigation={NAVIGATION}>
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
