import * as React from 'react';
import { useRouter } from 'next/router';
import { asArray } from '@toolpad/utils/collections';
import {
  AppProvider as BaseAppProvider,
  AppProviderProps as BaseAppProviderProps,
  Navigate,
  Router,
} from '../AppProvider';

export function AppProvider(props: BaseAppProviderProps) {
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

  return <BaseAppProvider router={routerImpl} {...props} />;
}
