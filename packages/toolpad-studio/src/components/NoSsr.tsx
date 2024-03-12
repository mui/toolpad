import * as React from 'react';

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return false;
}

function getServerSnapshot() {
  return true;
}

/**
 * Returns true when serverside rendering, or when hydrating.
 */
export function useIsSsr(defer: boolean = false): boolean {
  const isSsrInitialValue = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isSsr, setIsSsr] = React.useState(defer ? true : isSsrInitialValue);
  React.useEffect(() => setIsSsr(false), []);
  return isSsr;
}

export interface NoSsrProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  defer?: boolean;
}

/**
 * Alternative version of MUI NoSsr that avoids state updates during layout effects.
 */
export default function NoSsr({ children, defer, fallback = null }: NoSsrProps) {
  const isSsr = useIsSsr(defer);

  return <React.Fragment>{isSsr ? fallback : children}</React.Fragment>;
}
