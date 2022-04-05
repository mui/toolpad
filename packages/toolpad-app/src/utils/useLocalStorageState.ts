import * as React from 'react';

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
  const [storedValue, setStoredValue] = React.useState<V>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: React.SetStateAction<V>) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}
