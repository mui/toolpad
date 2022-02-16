import * as React from 'react';

export default function useDebounced<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  const timeoutRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delay);
    timeoutRef.current = timeoutId;
    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  React.useEffect(() => () => timeoutRef.current && clearTimeout(timeoutRef.current), []);

  return debouncedValue;
}
