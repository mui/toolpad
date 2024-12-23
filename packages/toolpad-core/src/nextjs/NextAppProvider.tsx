'use client';
import * as React from 'react';
import { useRouter } from 'next/compat/router';
import { NextAppProviderApp } from './NextAppProviderApp';
import { NextAppProviderPages } from './NextAppProviderPages';
import type { AppProviderProps } from '../AppProvider';

/**
 * @ignore - internal component.
 */
function AppProvider(props: AppProviderProps) {
  const router = useRouter();
  const AppProvider = router ? NextAppProviderPages : NextAppProviderApp;
  return <AppProvider {...props} />;
}

export { AppProvider };
