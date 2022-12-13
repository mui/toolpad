import * as React from 'react';
import NoSsr from '../components/NoSsr';

interface LazyComponentOptions {
  noSsr?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Extends React.lazy with automatic fallback support and adds the ability to exclude SSR.
 */
export default function lazyComponent<T extends React.ComponentType<any>>(
  importComponent: () => Promise<{ default: T }>,
  { noSsr, fallback }: LazyComponentOptions = {},
): React.ComponentType<React.ComponentPropsWithRef<T>> {
  const LazyComponent: any = React.lazy(importComponent);

  return React.forwardRef<T, React.ComponentPropsWithoutRef<T>>((props, ref) => {
    let content = <LazyComponent ref={ref} {...props} />;

    if (noSsr) {
      content = <NoSsr>{content}</NoSsr>;
    }

    if (fallback) {
      content = <React.Suspense fallback={fallback}>{content}</React.Suspense>;
    }

    return content;
  });
}
