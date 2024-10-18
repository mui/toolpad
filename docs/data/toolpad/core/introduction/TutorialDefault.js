import * as React from 'react';
import PropTypes from 'prop-types';
import { createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { useDemoRouter } from '@toolpad/core/internal';

const NAVIGATION = [
  {
    segment: '',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
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

function DemoPageContent({ pathname }) {
  switch (pathname) {
    case '/':
      return <PageContainer>Hello world!</PageContainer>;
    case '/orders':
      return <PageContainer>Orders page</PageContainer>;
    default:
      return null;
  }
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function TutorialDefault(props) {
  const { window } = props;

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  const demoRouter = useDemoRouter('/page');

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={demoRouter}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout>
        <DemoPageContent pathname={demoRouter.pathname} />
      </DashboardLayout>
    </AppProvider>
  );
}

TutorialDefault.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default TutorialDefault;
