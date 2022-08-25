import * as React from 'react';

export default function useDebounced<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(() => value);
  const timeoutIdRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(
    () => () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    },
    [],
  );

  React.useEffect(() => {
    timeoutIdRef.current = setTimeout(() => setDebouncedValue(() => value), delay);

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, [value, delay]);

  return debouncedValue;
}
