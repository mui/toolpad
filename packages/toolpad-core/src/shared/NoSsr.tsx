import * as React from 'react';
import useSsr from '@toolpad/utils/hooks/useSsr';

export interface NoSsrProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * @ignore - internal component.
 * Alternative version of MUI NoSsr that avoids state updates during layout effects.
 */
export function NoSsr({ children, fallback = null }: NoSsrProps) {
  const isSsr = useSsr();

  return <React.Fragment>{isSsr ? fallback : children}</React.Fragment>;
}
