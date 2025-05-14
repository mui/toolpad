import * as React from 'react';
import type NextLinkType from 'next/link';
import { LinkProps } from '../shared/Link';
import { AppProvider } from '../AppProvider';
import type { AppProviderProps, Navigate, Router } from '../AppProvider';
import { usePathname, useSearchParams, useRouter } from './nextNavigation.cjs';
import NextLinkUntyped from './nextLink.cjs';

const NextLink = NextLinkUntyped as unknown as typeof NextLinkType;

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  const { href, history, ...rest } = props;
  return <NextLink ref={ref} href={href} replace={history === 'replace'} {...rest} />;
});
/**
 * @ignore - internal component.
 */
export function NextAppProviderApp(props: AppProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { push, replace } = useRouter();

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
      Link,
    }),
    [pathname, navigate, searchParams],
  );

  return <AppProvider router={routerImpl} {...props} />;
}
