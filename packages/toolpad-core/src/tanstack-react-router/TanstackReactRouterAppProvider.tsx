'use client';
import * as React from 'react';
import { useLocation, useNavigate, Link as TanstackReactRouterLink } from '@tanstack/react-router';
import { AppProvider, type AppProviderProps, Navigate, Router } from '../AppProvider/AppProvider';
import { LinkProps } from '../shared/Link';

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  const { href, history, ...rest } = props;
  return <TanstackReactRouterLink ref={ref} to={href} replace={history === 'replace'} {...rest} />;
});

function TanstackReactRouterAppProvider(props: AppProviderProps) {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  const navigateImpl = React.useCallback<Navigate>(
    (url, { history = 'auto' } = {}) => {
      if (history === 'auto' || history === 'push') {
        return navigate({ to: url as string });
      }
      if (history === 'replace') {
        return navigate({ to: url as string, replace: true });
      }
      throw new Error(`Invalid history option: ${history}`);
    },
    [navigate],
  );

  const routerImpl = React.useMemo<Router>(
    () => ({
      pathname,
      searchParams: new URLSearchParams(search),
      navigate: navigateImpl,
      Link,
    }),
    [pathname, search, navigateImpl],
  );

  return <AppProvider router={routerImpl} {...props} />;
}

export { TanstackReactRouterAppProvider };
