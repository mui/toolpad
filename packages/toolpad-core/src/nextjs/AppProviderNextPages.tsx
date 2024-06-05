import * as React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AppCacheProvider } from '@mui/material-nextjs/v14-pagesRouter';
import { asArray } from '@toolpad/utils/collections';
import { AppProvider, AppProviderProps } from '../AppProvider';
import { Navigate, Router } from '../shared/context';

/**
 * @ignore - internal component.
 */
export function AppProviderNextPages(props: AppProviderProps) {
  const { push, replace, asPath, query } = useRouter();

  const search = React.useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(query ?? {}).forEach(([key, value]) => {
      asArray(value ?? []).forEach((v) => {
        params.append(key, v);
      });
    });
    return params.toString();
  }, [query]);

  // Stable search params object
  const searchParams = React.useMemo(() => new URLSearchParams(search), [search]);

  const navigate = React.useCallback<Navigate>(
    (url, { history = 'auto' } = {}) => {
      if (history === 'auto' || history === 'push') {
        return push(String(url));
      }
      if (history === 'replace') {
        return replace(String(url));
      }
      throw new Error(`Invalid history option: ${history}`);
    },
    [push, replace],
  );

  const routerImpl = React.useMemo<Router>(
    () => ({
      pathname: asPath,
      searchParams,
      navigate,
    }),
    [asPath, navigate, searchParams],
  );

  return (
    <AppCacheProvider>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <AppProvider router={routerImpl} {...props} />
    </AppCacheProvider>
  );
}
