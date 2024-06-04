import * as React from 'react';
import Head from 'next/head';
import { AppCacheProvider } from '@mui/material-nextjs/v14-pagesRouter';
import { AppProvider, AppProviderProps } from '../../AppProvider';

function NextjsPagesRouterAppProvider(props: AppProviderProps) {
  return (
    <AppCacheProvider>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <AppProvider {...props} />
    </AppCacheProvider>
  );
}

export { NextjsPagesRouterAppProvider as AppProvider };
