import 'client-only';
import * as React from 'react';
import type { Datum } from './DataProvider';

export interface FilterOption<R, K extends keyof R & string = keyof R & string> {
  field: K;
  operator: string;
  value: R[K];
}

export function getKeyFromFilter<R extends Datum>(filter: Filter<R>): string {
  return JSON.stringify(filter);
}

export type Filter<R extends Datum> = {
  [field in keyof R & string]?: {
    [operator in string]?: string;
  };
};

export interface Codec<V> {
  parse: (value: string) => V;
  stringify: (value: V) => string;
}

export type CreateUrlParameterOptions<V> = {
  codec?: Codec<V>;
  defaultValue?: V;
} & (V extends string ? {} : { codec: Codec<V> });

const FilterContext = React.createContext<Filter<any>>({});

export const FilterProvider = FilterContext.Provider;

export function useFilter() {
  return React.useContext(FilterContext);
}

type UseUrlQueryParameterStateOptions<V> = {
  defaultValue?: V;
  codec?: Codec<V>;
} & (V extends string ? {} : { codec: Codec<V> });

interface NavigationEvent {
  destination: { url: URL };
  navigationType: 'push' | 'replace';
}

const navigateEventHandlers = new Set<(event: NavigationEvent) => void>();

type HistoryMethod = typeof window.history.pushState;

if (typeof window !== 'undefined') {
  const wrapHistoryMethod = (
    navigationType: 'push' | 'replace',
    origMethod: HistoryMethod,
  ): HistoryMethod => {
    return function historyMethodOverride(this: History, data, title, url?: string | URL | null) {
      if (url === null || url === undefined) {
        return;
      }
      const event = {
        destination: { url: new URL(url, window.location.href) },
        navigationType,
      };
      Promise.resolve().then(() => {
        navigateEventHandlers.forEach((handler) => {
          handler(event);
        });
      });
      origMethod.call(this, data, title, url);
    };
  };
  window.history.pushState = wrapHistoryMethod('push', window.history.pushState);
  window.history.replaceState = wrapHistoryMethod('replace', window.history.replaceState);
}

function navigate(url: string, options: { history?: 'push' | 'replace' } = {}) {
  const history = options.history ?? 'push';
  if (history === 'push') {
    window.history.pushState(null, '', url);
  } else {
    window.history.replaceState(null, '', url);
  }
}

function addNavigateEventListener(handler: (event: NavigationEvent) => void) {
  navigateEventHandlers.add(handler);
}

function removeNavigateEventListener(handler: (event: NavigationEvent) => void) {
  navigateEventHandlers.delete(handler);
}

function encode<V>(codec: Codec<V>, value: V | null): string | null {
  return value === null ? null : codec.stringify(value);
}

function decode<V>(codec: Codec<V>, value: string | null): V | null {
  return value === null ? null : codec.parse(value);
}

/**
 * Works like the React.useState hook, but synchronises the state with a URL query parameter named "name".
 * @param name
 * @param options
 */
export function useUrlQueryParameterState<V = string>(
  name: string,
  ...args: V extends string
    ? [UseUrlQueryParameterStateOptions<V>?]
    : [UseUrlQueryParameterStateOptions<V>]
): [V | null, (newValue: V | null) => void] {
  const [options] = args;
  const subscribe = React.useCallback((cb: () => void) => {
    const handler = () => {
      cb();
    };
    addNavigateEventListener(handler);
    return () => {
      removeNavigateEventListener(handler);
    };
  }, []);
  const getSnapshot = React.useCallback(() => {
    return new URL(window.location.href).searchParams.get(name);
  }, [name]);
  const getServerSnapshot = React.useCallback(() => null, []);
  const rawValue = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setValue = React.useCallback(
    (value: V | null) => {
      const url = new URL(window.location.href);
      const stringValue = options?.codec ? encode(options.codec, value) : (value as string);

      if (stringValue === null) {
        url.searchParams.delete(name);
      } else {
        const defaultValue = options?.defaultValue ?? null;
        const stringDefaultValue = options?.codec
          ? encode(options.codec, defaultValue)
          : defaultValue;

        if (stringValue === stringDefaultValue) {
          url.searchParams.delete(name);
        } else {
          url.searchParams.set(name, stringValue);
        }
      }

      navigate(url.toString(), { history: 'replace' });
    },
    [name, options?.codec, options?.defaultValue],
  );
  const value = React.useMemo(
    () =>
      options?.codec && typeof rawValue === 'string'
        ? decode(options.codec, rawValue)
        : (rawValue as V),
    [options?.codec, rawValue],
  );
  return [value ?? options?.defaultValue ?? null, setValue];
}
