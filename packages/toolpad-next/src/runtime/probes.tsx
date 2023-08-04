import * as React from 'react';
import { Emitter } from '@mui/toolpad-utils/events';

const values = new Map<string, unknown>();
const emitter = new Emitter<Record<string, null>>();

export function reset() {
  values.clear();
}

export function update(key: string, value: unknown) {
  values.set(key, value);
  emitter.emit(key, null);
}

export function subscribe(key: string, callback: () => void) {
  return emitter.subscribe(key, callback);
}

export function getSnapshot(key: string) {
  return values.get(key);
}

interface ProbeContextValue {
  update: (key: string, value: unknown) => void;
  subscribe: (key: string, callback: () => void) => () => void;
  getSnapshot: (key: string) => unknown;
}

const ProbeContext = React.createContext<ProbeContextValue | null>(null);

export interface ProbeProviderProps {
  children?: React.ReactNode;
}

export function useProbeTarget(key: string, value: unknown) {
  const probeContext = React.useContext(ProbeContext);
  React.useEffect(() => {
    update(key, value);
  }, [probeContext, key, value]);
}

export function useProbe(key: string) {
  const subscribeKey = React.useCallback((cb: () => void) => subscribe(key, cb), [key]);
  const getKeySnapshot = React.useCallback(() => getSnapshot(key), [key]);
  return React.useSyncExternalStore(subscribeKey, getKeySnapshot);
}

export function useProbes() {
  return React.useContext(ProbeContext);
}
