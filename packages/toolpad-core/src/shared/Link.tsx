import * as React from 'react';
import { RouterContext } from './context';

/**
 * @ignore - internal component.
 */

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  history?: 'auto' | 'push' | 'replace';
  href: string;
  to: string;
}

export const Link = React.forwardRef(function Link(
  props: LinkProps,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  const { children, href, onClick, history, to, ...rest } = props;
  const routerContext = React.useContext(RouterContext);

  const handleLinkClick = React.useMemo(() => {
    if (!routerContext) {
      return onClick;
    }
    return (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      const url = new URL(event.currentTarget.href);
      routerContext.navigate(url.pathname, { history });
      onClick?.(event);
    };
  }, [routerContext, onClick, history]);

  return routerContext?.Link && href ? (
    <routerContext.Link href={href} to={to} {...rest} onClick={onClick}>
      {children}
    </routerContext.Link>
  ) : (
    <a ref={ref} href={href} {...rest} onClick={handleLinkClick}>
      {children}
    </a>
  );
});
