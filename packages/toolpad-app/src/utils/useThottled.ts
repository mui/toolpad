import * as React from 'react';

export default function useThrottled<T>(value: T, throttle: number): T {
  const [throttledValue, setThrottledValue] = React.useState(value);
  const lastUpdate = React.useRef(Date.now());

  React.useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastUpdate.current;

    if (elapsed > throttle) {
      lastUpdate.current = now;
      setThrottledValue(value);
      return () => {};
    }

    const delay = throttle - elapsed;
    const timeoutId = setTimeout(() => setThrottledValue(value), delay);
    return () => clearTimeout(timeoutId);
  }, [value, throttle]);

  return throttledValue;
}
