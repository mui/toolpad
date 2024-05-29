import { AppProvider } from '@toolpad/core/AppProvider';
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
    slug: '/dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    slug: '/dashboard/orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
  },
];

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <AppProvider navigation={NAVIGATION}>{getLayout(<Component {...pageProps} />)}</AppProvider>
  );
}
