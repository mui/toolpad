import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TimelineIcon from '@mui/icons-material/Timeline';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';

const NAVIGATION = [
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

function DemoPageContent({ pathname }) {
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

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

const customTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#2A4364',
      paper: '#112E4D',
    },
  },
});

export default function AppProviderTheme() {
  const [pathname, setPathname] = React.useState('/page');

  const router = React.useMemo(() => {
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
        <DemoPageContent pathname={pathname} />
      </DashboardLayout>
    </AppProvider>
    // preview-end
  );
}
