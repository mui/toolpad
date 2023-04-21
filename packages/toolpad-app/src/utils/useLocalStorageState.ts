import * as React from 'react';
import { Emitter } from '@mui/toolpad-utils/events';

// storage events only work across windows, we'll use an event emitter to announce within the window
const emitter = new Emitter<Record<string, undefined>>();
// local cache, needed for getSnapshot
const cache = new Map<string, any>();

function subscribe(key: string, cb: () => void): () => void {
  const onKeyChange = () => {
    // invalidate local cache
    cache.delete(key);
    cb();
  };
  const storageHandler = (event: StorageEvent) => {
    if (event.storageArea === window.localStorage && event.key === key) {
      onKeyChange();
    }
  };
  window.addEventListener('storage', storageHandler);
  emitter.on(key, onKeyChange);
  return () => {
    window.removeEventListener('storage', storageHandler);
    emitter.off(key, onKeyChange);
  };
}

function getSnapshot<T = unknown>(key: string): T | undefined {
  try {
    let value = cache.get(key);
    if (!value) {
      const item = window.localStorage.getItem(key);
      value = item ? JSON.parse(item) : undefined;
      cache.set(key, value);
    }
    return value;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

function setValue<T = unknown>(key: string, value: T) {
  try {
    if (typeof window !== 'undefined') {
      cache.set(key, value);
      window.localStorage.setItem(key, JSON.stringify(value));
      emitter.emit(key);
    }
  } catch (error) {
    console.error(error);
  }
}

/**
 * Sync state to local storage so that it persists through a page refresh. Usage is
 * similar to useState except we pass in a local storage key so that we can default
 * to that value on page load instead of the specified initial value.
 *
 * Since the local storage API isn't available in server-rendering environments, we
 * return initialValue during SSR and hydration.
 *
 * Things this hook does different from existing solutions:
 * - SSR-capable: it shows initial value during SSR and hydration, but immediately
 *   initializes when clientside mounted.
 * - Sync state across tabs: When another tab changes the value in local storage, the
 *   current tab follows suit.
 */
export default function useLocalStorageState<V>(
  key: string,
  initialValue: V,
): [V, React.Dispatch<React.SetStateAction<V>>] {
  const subscribeKey = React.useCallback((cb: () => void) => subscribe(key, cb), [key]);
  const getKeySnapshot = React.useCallback(
    () => getSnapshot<V>(key) ?? initialValue,
    [initialValue, key],
  );
  const getKeyServerSnapshot = React.useCallback(() => initialValue, [initialValue]);

  const storedValue: V = React.useSyncExternalStore(
    subscribeKey,
    getKeySnapshot,
    getKeyServerSnapshot,
  );

  const setStoredValue = React.useCallback(
    (value: React.SetStateAction<V>) => {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setValue(key, valueToStore);
    },
    [key, storedValue],
  );

  return [storedValue, setStoredValue];
}
