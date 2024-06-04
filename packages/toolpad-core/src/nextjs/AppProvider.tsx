'use client';
import * as React from 'react';
import { useRouter } from 'next/compat/router';
import { AppProviderNextApp } from './AppProviderNextApp';
import { AppProviderNextPages } from './AppProviderNextPages';
import { AppProviderProps } from '../AppProvider';

export function AppProvider(props: AppProviderProps) {
  const router = useRouter();
  const AppProviderComponent = router ? AppProviderNextPages : AppProviderNextApp;
  return <AppProviderComponent {...props} />;
}
