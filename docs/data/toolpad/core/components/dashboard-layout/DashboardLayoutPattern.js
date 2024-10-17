import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';

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

function DemoPageContent({ pathname, navigate }) {
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
      <Typography>
        <p>Dashboard content for {pathname}</p>
      </Typography>
      {pathname.startsWith('/orders') ? (
        <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
          <Button
            onClick={() => {
              navigate('/orders/1');
            }}
          >
            Order 1
          </Button>
          <Button
            onClick={() => {
              navigate('/orders/2');
            }}
          >
            Order 2
          </Button>
          <Button
            onClick={() => {
              navigate('/orders/3');
            }}
          >
            Order 3
          </Button>
        </Stack>
      ) : null}
    </Box>
  );
}

DemoPageContent.propTypes = {
  navigate: PropTypes.func.isRequired,
  pathname: PropTypes.string.isRequired,
};

function DashboardLayoutPattern(props) {
  const { window } = props;

  const router = useDemoRouter('/orders');

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  return (
    // preview-start
    <AppProvider
      navigation={[
        {
          segment: 'dashboard',
          title: 'Dashboard',
          icon: <DashboardIcon />,
        },
        {
          segment: 'orders',
          title: 'Orders',
          icon: <ShoppingCartIcon />,
          pattern: 'orders{/:orderId}*',
        },
      ]}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout>
        <DemoPageContent pathname={router.pathname} navigate={router.navigate} />
      </DashboardLayout>
    </AppProvider>
    // preview-end
  );
}

DashboardLayoutPattern.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default DashboardLayoutPattern;
