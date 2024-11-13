import * as React from 'react';
import PropTypes from 'prop-types';
import { createTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { createMemoryRouter, RouterProvider, Outlet } from 'react-router-dom';
import { AppProvider } from '@toolpad/core/react-router-dom';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';

function Layout() {
  return (
    <DashboardLayout>
      <PageContainer>
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
}

function DashboardPage() {
  return <Typography>Welcome to Toolpad!</Typography>;
}

function OrdersPage() {
  return <Typography>Welcome to the orders page!</Typography>;
}

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
    segment: 'orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
  },
];

const BRANDING = {
  title: 'My Toolpad Core App',
};

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

function App(props) {
  const { window } = props;

  return (
    <AppProvider
      navigation={NAVIGATION}
      branding={BRANDING}
      theme={demoTheme}
      window={window}
    >
      <Outlet />
    </AppProvider>
  );
}

App.propTypes = {
  window: PropTypes.object,
};

function ReactRouter(props) {
  const { window } = props;

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  // preview-start
  const router = React.useMemo(
    () =>
      createMemoryRouter([
        {
          element: <App window={demoWindow} />, // root layout route
          children: [
            {
              path: '/',
              Component: Layout,
              children: [
                {
                  path: '',
                  Component: DashboardPage,
                },
                {
                  path: 'orders',
                  Component: OrdersPage,
                },
              ],
            },
          ],
        },
      ]),
    [demoWindow],
  );

  return <RouterProvider router={router} />;
  // preview-end
}

ReactRouter.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func.isRequired,
};

export default ReactRouter;
