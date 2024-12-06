import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { Button } from '@mui/material';

const NAVIGATION = [
  {
    segment: 'dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
  },
  {
    segment: 'reports',
    title: 'Reports',
    icon: <BarChartIcon />,
  },
];

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function DemoPageContent({ pathname, toggleSidebar }) {
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
      <Button onClick={() => toggleSidebar()}>Toggle Sidebar</Button>
    </Box>
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
  toggleSidebar: PropTypes.shape({
    '__@hasInstance@2095': PropTypes.func.isRequired,
    '__@metadata@2097': PropTypes.any,
    apply: PropTypes.func.isRequired,
    arguments: PropTypes.any.isRequired,
    bind: PropTypes.func.isRequired,
    call: PropTypes.func.isRequired,
    caller: PropTypes.object.isRequired,
    length: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    prototype: PropTypes.any.isRequired,
    toString: PropTypes.func.isRequired,
  }).isRequired,
};

function DashboardLayoutSidebarCollapsedProp(props) {
  const { window } = props;

  const [pathname, setPathname] = React.useState('/dashboard');
  const [sidebarCollapsed, toggleSidebar] = React.useState(true);
  const router = React.useMemo(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    };
  }, [pathname]);

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout sidebarCollapsed={sidebarCollapsed}>
        <DemoPageContent
          pathname={pathname}
          toggleSidebar={() => toggleSidebar(!sidebarCollapsed)}
        />
      </DashboardLayout>
    </AppProvider>
  );
}

DashboardLayoutSidebarCollapsedProp.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default DashboardLayoutSidebarCollapsedProp;
