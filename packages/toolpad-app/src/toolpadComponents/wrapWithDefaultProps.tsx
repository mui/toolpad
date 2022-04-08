import * as React from 'react';

export default function wrapWithDefaultProps<P = {}>(
  Component: React.ComponentType<P>,
  defaultProps: Partial<React.PropsWithoutRef<P>>,
): React.ComponentType<P> {
  const Wrapped = React.forwardRef<React.Component, P>((props, ref) => (
    <Component ref={ref} {...props} />
  ));
  Wrapped.defaultProps = defaultProps;
  // @ts-expect-error
  return Wrapped;
}
