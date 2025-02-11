import * as React from 'react';
import { asArray } from '@toolpad/utils/collections';
import { useRouter } from 'next/router';
import { AppProvider } from '../AppProvider';
import type { AppProviderProps, Navigate, Router } from '../AppProvider';

/**
 * @ignore - internal component.
 */
export function NextAppProviderPages(props: AppProviderProps) {
  const { push, replace, pathname, query } = useRouter();

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
      pathname,
      searchParams,
      navigate,
    }),
    [navigate, pathname, searchParams],
  );

  return <AppProvider router={routerImpl} {...props} />;
}
