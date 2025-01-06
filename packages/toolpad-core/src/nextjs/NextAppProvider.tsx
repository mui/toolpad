'use client';
import * as React from 'react';
import { useRouter } from 'next/compat/router';
import { NextAppProviderApp } from './NextAppProviderApp';
import { NextAppProviderPages } from './NextAppProviderPages';
import type { AppProviderProps } from '../AppProvider';

function NextAppProvider(props: AppProviderProps) {
  const router = useRouter();
  const AppProvider = router ? NextAppProviderPages : NextAppProviderApp;
  return <AppProvider {...props} />;
}

export {
  NextAppProvider,
  /** TODO: Old usage, remove export from v0.14.0 */
  /** @deprecated Import `NextAppProvider` instead. */
  NextAppProvider as AppProvider,
};
