import * as React from 'react';

/**
 * Creates a debounced version of the handler that is passed. The invocation of [fn] is
 * delayed for [delay] milliseconds from the last invocation of the debounced function.
 */
export default function useDebouncedHandler<P extends any[]>(
  fn: (...params: P) => void,
  delay: number,
): (...params: P) => void {
  const fnRef = React.useRef(fn);
  React.useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const timeout = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(
    () => () => {
      if (timeout.current) {
        // TODO: Should this be optional? Someone might want to run the function, even after unmount.
        clearTimeout(timeout.current);
        timeout.current = null;
      }
    },
    [],
  );

  return React.useCallback(
    (...params: P) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
        timeout.current = null;
      }

      timeout.current = setTimeout(() => {
        fnRef.current(...params);
        timeout.current = null;
      }, delay);
    },
    [delay],
  );
}
