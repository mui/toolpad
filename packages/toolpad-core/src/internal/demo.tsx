'use client';
import * as React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { Router } from '../AppProvider';

/**
 * Internal utility for demos
 * @ignore - internal component.
 */

function useExternalProductionWarning({ featureName }: { featureName?: string }) {
  const isExternalProduction =
    typeof window !== 'undefined' &&
    window.location.hostname !== 'mui.com' &&
    process.env.NODE_ENV === 'production';

  React.useEffect(() => {
    if (isExternalProduction) {
      console.warn(
        `${featureName} is an internal feature of Toolpad Core. This feature is not meant for general usage in production.`,
      );
    }
  }, [featureName, isExternalProduction]);
}

interface DemoProviderProps {
  /**
   * The window where the application is rendered.
   * @default window
   */
  window?: Window;
  children: React.ReactNode;
}
// Wrapper for demo applications in the documentation
export function DemoProvider({ window: appWindow, children }: DemoProviderProps) {
  useExternalProductionWarning({ featureName: 'DemoProvider' });

  const demoEmotionCache = React.useMemo(
    () =>
      createCache({
        key: 'toolpad-demo-app',
        container: appWindow?.document.head,
      }),
    [appWindow?.document.head],
  );

  return <CacheProvider value={demoEmotionCache}>{children}</CacheProvider>;
}

const DUMMY_BASE = 'https://example.com';

/**
 * Hook to create a router for demos.
 * @returns An in-memory router To be used in demos demos.
 */
export function useDemoRouter(initialUrl: string = '/') {
  useExternalProductionWarning({ featureName: 'useDemoRouter' });

  const [url, setUrl] = React.useState(() => new URL(initialUrl, DUMMY_BASE));

  const router = React.useMemo<Router>(() => {
    return {
      pathname: url.pathname,
      searchParams: url.searchParams,
      navigate: (newUrl) => {
        const nextUrl = new URL(newUrl, DUMMY_BASE);
        if (nextUrl.pathname !== url.pathname || nextUrl.search !== url.search) {
          setUrl(nextUrl);
        }
      },
    };
  }, [url.pathname, url.search, url.searchParams]);

  return router;
}
