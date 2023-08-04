import * as React from 'react';
import { Emitter } from '@mui/toolpad-utils/events';
import invariant from 'invariant';

interface ProbeContextValue {
  update: (key: string, value: unknown) => void;
  subscribe: (key: string, callback: () => void) => () => void;
  getSnapshot: (key: string) => unknown;
}

const ProbeContext = React.createContext<ProbeContextValue | null>(null);

export interface ProbeProviderProps {
  children?: React.ReactNode;
}

export function ProbeProvider({ children }: ProbeProviderProps) {
  const contextValue = React.useMemo(() => {
    const values = new Map<string, unknown>();
    const emitter = new Emitter<Record<string, null>>();
    return {
      update: (key: string, value: unknown) => {
        values.set(key, value);
        emitter.emit(key, null);
      },
      subscribe: (key: string, callback: () => void) => {
        return emitter.subscribe(key, callback);
      },
      getSnapshot: (key: string) => {
        return values.get(key);
      },
    };
  }, []);
  return <ProbeContext.Provider value={contextValue}>{children}</ProbeContext.Provider>;
}

export function useProbeTarget(key: string, value: unknown) {
  const probeContext = React.useContext(ProbeContext);
  React.useEffect(() => {
    if (probeContext) {
      probeContext.update(key, value);
    }
  }, [probeContext, key, value]);
}

export function useProbe(key: string) {
  const probeContext = React.useContext(ProbeContext);
  invariant(probeContext, 'useProbe must be used inside a ProbeProvider');
  const subscribe = React.useCallback(
    (cb: () => void) => probeContext.subscribe(key, cb),
    [key, probeContext],
  );
  const getSnapshot = React.useCallback(() => probeContext.getSnapshot(key), [key, probeContext]);
  return React.useSyncExternalStore(subscribe, getSnapshot);
}

export function useProbes() {
  return React.useContext(ProbeContext);
}
