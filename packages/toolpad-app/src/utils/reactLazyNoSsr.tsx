import { NoSsr } from '@mui/material';
import * as React from 'react';

export default function reactLazyNoSsr<T extends React.ComponentType<any>>(
  importComponent: () => Promise<{ default: T }>,
): React.ComponentType<React.ComponentPropsWithRef<T>> {
  const LazyComponent: any = React.lazy(importComponent);

  return React.forwardRef<T, React.ComponentPropsWithoutRef<T>>((props, ref) => {
    return (
      <NoSsr>
        <LazyComponent ref={ref} {...props} />
      </NoSsr>
    );
  });
}
