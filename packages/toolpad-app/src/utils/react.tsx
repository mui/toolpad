import Emitter from '@mui/toolpad-core/utils/Emitter';
import * as React from 'react';

/**
 * Like `Array.prototype.join`, but for React nodes.
 */
export function interleave(items: React.ReactNode[], separator: React.ReactNode): React.ReactNode {
  const result: React.ReactNode[] = [];

  for (let i = 0; i < items.length; i += 1) {
    if (i > 0) {
      result.push(separator);
    }
    result.push(items[i]);
  }

  return result;
}

/**
 * Create a shared state to be used across the application. Returns a useState hook that
 * is synchronized on the same state between all instances where it is called.
 */
export function createGlobalState<T = undefined>(initialValue: T) {
  const emitter = new Emitter<{ change: {} }>();

  let result: [T, React.Dispatch<React.SetStateAction<T>>];

  const setState: React.Dispatch<React.SetStateAction<T>> = (newValue) => {
    const updateValue =
      typeof newValue === 'function' ? (newValue as (newValue: T) => T)(result[0]) : newValue;

    if (updateValue !== result[0]) {
      result = [updateValue, setState];
      emitter.emit('change', {});
    }
  };

  result = [initialValue, setState];

  const subscribe = (cb: () => void) => {
    emitter.on('change', cb);
    return () => {
      emitter.off('change', cb);
    };
  };

  const getSnapshot = () => result;

  return function useGlobalState() {
    return React.useSyncExternalStore<[T, React.Dispatch<React.SetStateAction<T>>]>(
      subscribe,
      getSnapshot,
      getSnapshot,
    );
  };
}
