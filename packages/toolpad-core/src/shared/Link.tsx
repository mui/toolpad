import * as React from 'react';
import { RouterContext } from './context';

/**
 * @ignore - internal component.
 */

export interface DefaultLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  history?: 'auto' | 'push' | 'replace';
  href: string;
}

export const DefaultLink = React.forwardRef(function Link(
  props: DefaultLinkProps,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  const { children, href, onClick, history, ...rest } = props;
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

  return (
    <a ref={ref} href={href} {...rest} onClick={handleLinkClick}>
      {children}
    </a>
  );
});

export interface LinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  style?: React.CSSProperties;
}

export const Link = React.forwardRef(function Link(
  props: LinkProps,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  const routerContext = React.useContext(RouterContext);
  const LinkComponent = routerContext?.Link ?? DefaultLink;
  return (
    <LinkComponent ref={ref} {...props}>
      {props.children}
    </LinkComponent>
  );
});
