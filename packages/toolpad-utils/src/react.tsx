import * as React from 'react';
import * as ReactIs from 'react-is';

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

export function useAssertedContext<T>(context: React.Context<T | undefined>): T {
  const value = React.useContext(context);
  if (value === undefined) {
    throw new Error('context was used without a Provider');
  }
  return value;
}

/**
 * Debugging tool that logs updates to props.
 */
export function useTraceUpdates<P extends object>(prefix: string, props: P) {
  const prev = React.useRef<P>(props);
  React.useEffect(() => {
    const changedProps: Partial<P> = {};

    for (const key of Object.keys(props) as (keyof P)[]) {
      if (!Object.is(prev.current[key], props[key])) {
        changedProps[key] = props[key];
      }
    }

    if (Object.keys(changedProps).length > 0) {
      // eslint-disable-next-line no-console
      console.log(`${prefix} changed props:`, changedProps);
    }

    prev.current = props;
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function getComponentDisplayName(Component: React.ComponentType<any> | string) {
  if (typeof Component === 'string') {
    return Component || 'Unknown';
  }

  return Component.displayName || Component.name;
}

/**
 * Create a shared state to be used across the application. Returns a useState hook that
 * is synchronized on the same state between all instances where it is called.
 */
export function createGlobalState<T>(initialState: T) {
  let state = initialState;
  const listeners: Array<(state: T) => void> = [];

  const subscribe = (cb: (state: T) => void) => {
    listeners.push(cb);
    return () => {
      const index = listeners.indexOf(cb);
      listeners.splice(index, 1);
    };
  };

  const getState = () => state;

  const setState = (newState: T | ((oldValue: T) => T)) => {
    state = typeof newState === 'function' ? (newState as Function)(state) : newState;
    listeners.forEach((cb) => cb(state));
  };

  const useValue = () => React.useSyncExternalStore(subscribe, getState, getState);

  const useState = (): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const value = useValue();
    return [value, setState];
  };

  return {
    getState,
    setState,
    useValue,
    useState,
    subscribe,
  };
}
