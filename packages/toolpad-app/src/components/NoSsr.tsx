import * as React from 'react';

export function useIsSsr(): boolean {
  const isSsrDefault = React.useSyncExternalStore(
    () => () => {},
    () => false,
    () => true,
  );
  const [isSsr, setIsSsr] = React.useState(isSsrDefault);
  React.useEffect(() => setIsSsr(false), []);
  return isSsr;
}

export interface NoSsrProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Version of MUI NoSsr that starts rendered when mounting happens on the client side
 */
export default function NoSsr({ children, fallback = null }: NoSsrProps) {
  const isSsr = useIsSsr();
  return <React.Fragment>{isSsr ? fallback : children}</React.Fragment>;
}
