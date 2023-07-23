import * as React from 'react';
import { Emitter } from '../events';

// storage events only work across windows, we'll use an event emitter to announce within the window
const emitter = new Emitter<Record<string, null>>();
// local cache, needed for getSnapshot
const cache = new Map<string, string>();

function subscribe(area: Storage, key: string, cb: () => void): () => void {
  const onKeyChange = () => {
    // invalidate local cache
    cache.delete(key);
    cb();
  };
  const storageHandler = (event: StorageEvent) => {
    if (event.storageArea === area && event.key === key) {
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

function getSnapshot(area: Storage, key: string): string | null {
  let value = cache.get(key) ?? null;
  if (!value) {
    const item = area.getItem(key);
    value = item;
    if (value === null) {
      cache.delete(key);
    } else {
      cache.set(key, value);
    }
  }
  return value;
}

function setValue(area: Storage, key: string, value: string | null) {
  if (typeof window !== 'undefined') {
    if (value === null) {
      cache.delete(key);
      area.removeItem(key);
    } else {
      cache.set(key, value);
      area.setItem(key, String(value));
    }
    emitter.emit(key, null);
  }
}

type Initializer<T> = () => T;

type UseStorageStateHookResult<T> = [T, React.Dispatch<React.SetStateAction<T>>];

function useStorageStateServer(
  kind: 'session' | 'local',
  key: string,
  initializer: string | Initializer<string>,
): UseStorageStateHookResult<string>;
function useStorageStateServer(
  kind: 'session' | 'local',
  key: string,
  initializer?: string | null | Initializer<string | null>,
): UseStorageStateHookResult<string | null>;
function useStorageStateServer(
  kind: 'session' | 'local',
  key: string,
  initializer: string | null | Initializer<string | null> = null,
): UseStorageStateHookResult<string | null> | UseStorageStateHookResult<string> {
  const [initialValue] = React.useState(initializer);
  return [initialValue, () => {}];
}

/**
 * Sync state to local/session storage so that it persists through a page refresh. Usage is
 * similar to useState except we pass in a storage key so that we can default
 * to that value on page load instead of the specified initial value.
 *
 * Since the storage API isn't available in server-rendering environments, we
 * return initialValue during SSR and hydration.
 *
 * Things this hook does different from existing solutions:
 * - SSR-capable: it shows initial value during SSR and hydration, but immediately
 *   initializes when clientside mounted.
 * - Sync state across tabs: When another tab changes the value in the storage area, the
 *   current tab follows suit.
 */
function useStorageStateBrowser(
  kind: 'session' | 'local',
  key: string,
  initializer: string | Initializer<string>,
): UseStorageStateHookResult<string>;
function useStorageStateBrowser(
  kind: 'session' | 'local',
  key: string,
  initializer?: string | null | Initializer<string | null>,
): UseStorageStateHookResult<string | null>;
function useStorageStateBrowser(
  kind: 'session' | 'local',
  key: string,
  initializer: string | null | Initializer<string | null> = null,
): UseStorageStateHookResult<string | null> | UseStorageStateHookResult<string> {
  const [initialValue] = React.useState(initializer);
  const area = kind === 'session' ? window.sessionStorage : window.localStorage;
  const subscribeKey = React.useCallback((cb: () => void) => subscribe(area, key, cb), [area, key]);
  const getKeySnapshot = React.useCallback(
    () => getSnapshot(area, key) ?? initialValue,
    [area, initialValue, key],
  );
  const getKeyServerSnapshot = React.useCallback(() => initialValue, [initialValue]);

  const storedValue = React.useSyncExternalStore(
    subscribeKey,
    getKeySnapshot,
    getKeyServerSnapshot,
  );

  const setStoredValue = React.useCallback(
    (value: React.SetStateAction<string | null>) => {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setValue(area, key, valueToStore);
    },
    [area, key, storedValue],
  );

  return [storedValue, setStoredValue];
}

export default typeof window === 'undefined' ? useStorageStateServer : useStorageStateBrowser;
