'use client';
import * as React from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import {
  AppProvider as AppProviderComponent,
  type AppProviderProps,
  Navigate,
  Router,
} from '../AppProvider';

/**
 * @ignore - internal component.
 */
function AppProvider(props: AppProviderProps) {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const navigateImpl = React.useCallback<Navigate>(
    (url, { history = 'auto' } = {}) => {
      if (history === 'auto' || history === 'push') {
        return navigate(url);
      }
      if (history === 'replace') {
        return navigate(url, { replace: true });
      }
      throw new Error(`Invalid history option: ${history}`);
    },
    [navigate],
  );

  const routerImpl = React.useMemo<Router>(
    () => ({
      pathname,
      searchParams,
      navigate: navigateImpl,
    }),
    [pathname, searchParams, navigateImpl],
  );

  return <AppProviderComponent router={routerImpl} {...props} />;
}

export { AppProvider };
