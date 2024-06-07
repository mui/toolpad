import { AppProvider } from '@toolpad/core/nextjs';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import Head from 'next/head';
import { AppCacheProvider } from '@mui/material-nextjs/v14-pagesRouter';
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

export default function App(props: AppPropsWithLayout) {
  const { Component, pageProps } = props;

  const getLayout = Component.getLayout ?? getDefaultLayout;

  return (
    <AppCacheProvider {...props}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <AppProvider navigation={NAVIGATION}>{getLayout(<Component {...pageProps} />)}</AppProvider>
    </AppCacheProvider>
  );
}
