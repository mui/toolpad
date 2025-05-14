'use client';
import * as React from 'react';
import type { AppProviderProps } from '../AppProvider';
import { useRouter } from './nextCompatRouter.cjs';
import { NextAppProviderApp } from './NextAppProviderApp';
import { NextAppProviderPages } from './NextAppProviderPages';

function NextAppProvider(props: AppProviderProps) {
  const router = useRouter();
  const AppProvider = router ? NextAppProviderPages : NextAppProviderApp;
  return <AppProvider {...props} />;
}

export { NextAppProvider };
