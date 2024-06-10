import * as React from 'react';

export interface Codec<V> {
  parse: (value: string) => V;
  stringify: (value: V) => string;
}

type UseSearchParamStateOptions<V> = {
  defaultValue?: V;
  history?: 'push' | 'replace';
  codec?: Codec<V>;
} & (V extends string ? {} : { codec: Codec<V> });

interface NavigationEvent {
  destination: { url: URL };
  navigationType: 'push' | 'replace';
}

const navigateEventHandlers = new Set<(event: NavigationEvent) => void>();

if (typeof window !== 'undefined') {
  const origHistoryPushState = window.history.pushState;
  const origHistoryReplaceState = window.history.replaceState;
  const wrapHistoryMethod = (
    navigationType: 'push' | 'replace',
    origMethod: typeof origHistoryPushState,
  ): typeof origHistoryPushState => {
    return function historyMethod(this: History, data, title, url?: string | URL | null): void {
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
  window.history.pushState = wrapHistoryMethod('push', origHistoryPushState);
  window.history.replaceState = wrapHistoryMethod('replace', origHistoryReplaceState);
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
export function useSearchParamState<V = string>(
  name: string,
  initialValue: V,
  ...args: V extends string ? [UseSearchParamStateOptions<V>?] : [UseSearchParamStateOptions<V>]
): [V, (newValue: V) => void] {
  const [options] = args;
  const { codec } = options ?? {};

  const subscribe = React.useCallback((cb: () => void) => {
    const handler = (event: NavigationEvent) => {
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
      const stringValue = codec ? encode(codec, value) : (value as string);

      if (stringValue === null) {
        url.searchParams.delete(name);
      } else {
        const stringDefaultValue = codec ? encode(codec, initialValue) : initialValue;

        if (stringValue === stringDefaultValue) {
          url.searchParams.delete(name);
        } else {
          url.searchParams.set(name, stringValue);
        }
      }

      navigate(url.toString(), { history: 'replace' });
    },
    [name, codec, initialValue],
  );
  const value = React.useMemo(
    () => (codec && typeof rawValue === 'string' ? codec.parse(rawValue) : (rawValue as V)),
    [codec, rawValue],
  );
  return [value ?? initialValue, setValue];
}
