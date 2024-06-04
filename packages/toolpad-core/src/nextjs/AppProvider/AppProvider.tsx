import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { AppProvider, AppProviderProps } from '../../AppProvider';

function NextjsAppProvider(props: AppProviderProps) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <AppProvider {...props} />
    </AppRouterCacheProvider>
  );
}

export { NextjsAppProvider as AppProvider };
