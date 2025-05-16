import * as React from 'react';
import { asArray } from '@toolpad/utils/collections';
import type NextLinkType from 'next/link';
import { LinkProps } from '../shared/Link';
import { AppProvider } from '../AppProvider';
import type { AppProviderProps, Navigate, Router } from '../AppProvider';
import { useRouter } from './nextRouter.cjs';
import NextLinkUntyped from './nextLink.cjs';

const NextLink = NextLinkUntyped as unknown as typeof NextLinkType;

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  const { href, history, ...rest } = props;
  return <NextLink ref={ref} href={href} replace={history === 'replace'} {...rest} />;
});

/**
 * @ignore - internal component.
 */
export function NextAppProviderPages(props: AppProviderProps) {
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
      pathname: asPath.split('?')[0],
      searchParams,
      navigate,
      Link,
    }),
    [asPath, navigate, searchParams],
  );

  return <AppProvider router={routerImpl} {...props} />;
}
