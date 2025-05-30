'use client';
import * as React from 'react';
import { useLocation, useNavigate, Link as TanStackRouterLink } from '@tanstack/react-router';
import { mapProperties } from '@toolpad/utils/collections';
import { AppProvider, type AppProviderProps, Navigate, Router } from '../AppProvider/AppProvider';
import { LinkProps } from '../shared/Link';

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  const { href, history, ...rest } = props;
  return <TanStackRouterLink ref={ref} to={href} replace={history === 'replace'} {...rest} />;
});

function TanStackRouterAppProvider(props: AppProviderProps) {
  const { pathname, search } = useLocation();

  // TansStack Router's search automatically parses stringified values, which is incompatible with our standard implementation.
  const searchParams = React.useMemo(
    () =>
      new URLSearchParams(
        mapProperties(search, ([key, value]: [key: string, value: unknown]) => [
          key,
          JSON.stringify(value),
        ]),
      ),
    [search],
  );

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
      searchParams,
      navigate: navigateImpl,
      Link,
    }),
    [navigateImpl, pathname, searchParams],
  );

  return <AppProvider router={routerImpl} {...props} />;
}

export { TanStackRouterAppProvider };
