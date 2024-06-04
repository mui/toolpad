import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import type { NextPage } from 'next';

import type { AppProps } from 'next/app';
import type { Navigation } from '@toolpad/core';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    slug: '/',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    slug: '/orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
  },
];

function getDefaultLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? getDefaultLayout;

  return (
    <AppProvider navigation={NAVIGATION}>{getLayout(<Component {...pageProps} />)}</AppProvider>
  );
}
