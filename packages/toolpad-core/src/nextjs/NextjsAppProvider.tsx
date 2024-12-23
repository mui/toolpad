'use client';
import * as React from 'react';
import { useRouter } from 'next/compat/router';
import { NextjsAppProviderApp } from './NextjsAppProviderApp';
import { NextjsAppProviderPages } from './NextjsAppProviderPages';
import type { AppProviderProps } from '../AppProvider';

/**
 * @ignore - internal component.
 */
function AppProvider(props: AppProviderProps) {
  const router = useRouter();
  const AppProviderComponent = router ? NextjsAppProviderPages : NextjsAppProviderApp;
  return <AppProviderComponent {...props} />;
}

export { AppProvider };
