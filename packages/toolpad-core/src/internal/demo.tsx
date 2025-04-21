'use client';
import * as React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { Router } from '../AppProvider';

/**
 * Internal utility for demos
 * @ignore - internal component.
 */

interface DemoProviderProps {
  /**
   * The window where the application is rendered.
   * @default window
   */
  window?: Window;
  children: React.ReactNode;
}

export function DemoProvider({ window, children }: DemoProviderProps) {
  const demoEmotionCache = React.useMemo(
    () =>
      createCache({
        key: 'toolpad-demo-app',
        container: window?.document.head,
      }),
    [window?.document.head],
  );

  return <CacheProvider value={demoEmotionCache}>{children}</CacheProvider>;
}

const DUMMY_BASE = 'https://example.com';

/**
 * Hook to create a router for demos.
 * @returns An in-memory router To be used in demos demos.
 */
export function useDemoRouter(initialUrl: string = '/') {
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
