'use client';
import * as React from 'react';
import { useSearchParams, useLocation, useNavigate, Link as ReactRouterLink } from 'react-router';
import { AppProvider, type AppProviderProps, Navigate, Router } from '../AppProvider/AppProvider';
import { LinkProps } from '../shared/Link';

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  const { href, ...rest } = props;
  return <ReactRouterLink ref={ref} to={href} {...rest} />;
});

function ReactRouterAppProvider(props: AppProviderProps) {
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
      Link,
    }),
    [pathname, searchParams, navigateImpl],
  );

  return <AppProvider router={routerImpl} {...props} />;
}

export {
  ReactRouterAppProvider,
  /** TODO: Old usage, remove export from v0.14.0 */
  /** @deprecated Import `ReactRouterAppProvider` instead. */
  ReactRouterAppProvider as AppProvider,
};
