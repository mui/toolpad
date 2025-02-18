'use client';
import * as React from 'react';

interface Handler<P extends unknown[]> {
  (...params: P): void;
}

interface DelayedInvocation<P extends unknown[]> {
  startTime: number;
  timeout: NodeJS.Timeout;
  params: P;
}

function defer<P extends unknown[]>(
  fn: React.MutableRefObject<Handler<P>>,
  params: P,
  delay: number,
) {
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
export default function useDebouncedHandler<P extends unknown[]>(
  fn: Handler<P>,
  delay: number,
): Handler<P> {
  const fnRef = React.useRef(fn);
  React.useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const delayedInvocation = React.useRef<DelayedInvocation<P> | null>(null);

  const clearCurrent = React.useCallback(() => {
    if (delayedInvocation.current) {
      clearTimeout(delayedInvocation.current.timeout);
      delayedInvocation.current = null;
    }
  }, []);

  React.useEffect(() => {
    if (!delayedInvocation.current) {
      return;
    }

    const { startTime, params } = delayedInvocation.current;

    const elapsed = Date.now() - startTime;
    const newDelay = Math.max(delay - elapsed, 0);

    clearCurrent();
    delayedInvocation.current = defer(fnRef, params, newDelay);
  }, [delay, clearCurrent]);

  return React.useCallback(
    (...params: P) => {
      clearCurrent();
      delayedInvocation.current = defer(fnRef, params, delay);
    },
    [delay, clearCurrent],
  );
}
