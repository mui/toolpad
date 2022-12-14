import * as React from 'react';

interface Handler<P extends any[]> {
  (...params: P): void;
}

interface DelayedInvocation<P extends any[]> {
  startTime: number;
  timeout: NodeJS.Timeout;
  params: P;
}

function clear<P extends any[]>(
  delayedInvocation: React.MutableRefObject<DelayedInvocation<P> | null>,
) {
  if (delayedInvocation.current) {
    clearTimeout(delayedInvocation.current.timeout);
    delayedInvocation.current = null;
  }
}

function defer<P extends any[]>(fn: React.MutableRefObject<Handler<P>>, params: P, delay: number) {
  const timeout = setTimeout(() => {
    fn.current(...params);
  }, delay);

  return { startTime: Date.now(), timeout, params };
}

/**
 * Creates a debounced version of the handler that is passed. The invocation of [fn] is
 * delayed for [delay] milliseconds from the last invocation of the debounced function.
 *
 * This implementation adds on the lodash implementation in that it handles updates to the
 * delay value.
 */
export default function useDebouncedHandler<P extends any[]>(
  fn: Handler<P>,
  delay: number,
): Handler<P> {
  const fnRef = React.useRef(fn);
  React.useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const delayedInvocation = React.useRef<DelayedInvocation<P> | null>(null);

  React.useEffect(() => {
    if (!delayedInvocation.current) {
      return;
    }

    const { startTime, params } = delayedInvocation.current;

    const elapsed = Date.now() - startTime;
    const newDelay = Math.max(delay - elapsed, 0);

    clear(delayedInvocation);
    delayedInvocation.current = defer(fnRef, params, newDelay);
  }, [delay]);

  return React.useCallback(
    (...params: P) => {
      clear(delayedInvocation);
      delayedInvocation.current = defer(fnRef, params, delay);
    },
    [delay],
  );
}
