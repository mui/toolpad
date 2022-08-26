import * as React from 'react';

const subscribe = () => () => {};
const getSnapshot = () => false;
const getServerSnapshot = () => true;

export function useIsSsr(defer: boolean = false): boolean {
  const isSsrDefault = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isSsr, setIsSsr] = React.useState(defer ? true : isSsrDefault);
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
