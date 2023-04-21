import * as React from 'react';
import * as ReactIs from 'react-is';
import { Emitter } from './events';

/**
 * Like `Array.prototype.join`, but for React nodes.
 */
export function interleave(items: React.ReactNode[], separator: React.ReactNode): React.ReactNode {
  const result: React.ReactNode[] = [];

  for (let i = 0; i < items.length; i += 1) {
    if (i > 0) {
      if (ReactIs.isElement(separator)) {
        result.push(React.cloneElement(separator, { key: `separator-${i}` }));
      } else {
        result.push(separator);
      }
    }

    const item = items[i];
    result.push(item);
  }

  return <React.Fragment>{result}</React.Fragment>;
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

  const subscribe = (cb: () => void) => emitter.subscribe('change', cb);

  const getSnapshot = () => result;

  return function useGlobalState() {
    return React.useSyncExternalStore<[T, React.Dispatch<React.SetStateAction<T>>]>(
      subscribe,
      getSnapshot,
      getSnapshot,
    );
  };
}

/**
 * Consume a context but throw when used outside of a provider.
 */
export function useNonNullableContext<T>(context: React.Context<T>, name?: string): NonNullable<T> {
  const maybeContext = React.useContext(context);
  if (maybeContext === null || maybeContext === undefined) {
    throw new Error(`context "${name}" was used without a Provider`);
  }
  return maybeContext;
}

/**
 * Context that throws when used outside of a provider.
 */
export function createProvidedContext<T>(
  name?: string,
): [() => T, React.ComponentType<React.ProviderProps<T>>] {
  const context = React.createContext<T | undefined>(undefined);
  const useContext = () => useNonNullableContext(context, name);
  return [useContext, context.Provider as React.ComponentType<React.ProviderProps<T>>];
}
