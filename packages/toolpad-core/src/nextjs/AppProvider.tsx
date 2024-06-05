'use client';
import * as React from 'react';
import { useRouter } from './nextCompatRouter';
import { AppProviderNextApp } from './AppProviderNextApp';
import { AppProviderNextPages } from './AppProviderNextPages';
import { AppProviderProps } from '../AppProvider';

/**
 *
 * Demos:
 *
 * - [App Provider](https://mui.com/toolpad/core/react-app-provider/)
 * - [Dashboard Layout](https://mui.com/toolpad/core/react-dashboard-layout/)
 *
 * API:
 *
 * - [AppProvider API](https://mui.com/toolpad/core/api/app-provider)
 */
function AppProvider(props: AppProviderProps) {
  const router = useRouter();
  const AppProviderComponent = router ? AppProviderNextPages : AppProviderNextApp;
  return <AppProviderComponent {...props} />;
}

export { AppProvider };
