'use client';
import * as React from 'react';
import { useRouter } from 'next/compat/router';
import { NextAppProviderApp } from './NextAppProviderApp';
import { NextAppProviderPages } from './NextAppProviderPages';
import type { AppProviderProps } from '../AppProvider';

function AppProvider(props: AppProviderProps) {
  const router = useRouter();
  const AppProviderComponent = router ? NextAppProviderPages : NextAppProviderApp;
  return <AppProviderComponent {...props} />;
}

export { AppProvider };
