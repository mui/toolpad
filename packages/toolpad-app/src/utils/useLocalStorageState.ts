import * as React from 'react';
import mitt from 'mitt';

const emitter = mitt();
const cache = new Map<string, any>();

function subscribe(key: string, cb: () => void): () => void {
  const onKeyChange = () => {
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
 * check that typeof window !== "undefined" to make SSR and SSG work properly.
 *
 * based on https://github.com/uidotdev/usehooks/blob/d599adfa48c4c0e2008bf3cdfc5792b583fd06d7/src/pages/useLocalStorage.md
 * LICENSE: https://github.com/uidotdev/usehooks/blob/d599adfa48c4c0e2008bf3cdfc5792b583fd06d7/LICENSE
 */
export default function useLocalStorageState<V>(
  key: string,
  initialValue: V,
): [V, React.Dispatch<React.SetStateAction<V>>] {
  const storedValue: V = React.useSyncExternalStore(
    (cb) => subscribe(key, cb),
    () => getSnapshot(key) ?? initialValue,
    () => initialValue,
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
