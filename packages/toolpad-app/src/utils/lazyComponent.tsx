import { NoSsr } from '@mui/material';
import * as React from 'react';

interface LazyComponentOptions {
  noSsr?: boolean;
  fallback?: React.ReactNode;
}

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
