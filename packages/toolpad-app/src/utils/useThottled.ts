import * as React from 'react';
/**
 * This hook allows you to throttle any fast changing value. The throttle value will only
 * update once in the defined time period. Multiple changes to the value within this time
 * period are throttled until the delay has passed.
 */
export default function useThrottled<T>(value: T, throttle: number): T {
  const [throttledValue, setThrottledValue] = React.useState(value);
  const lastUpdate = React.useRef(-Infinity);

  const updateThrottledValue = React.useCallback((newValue: T) => {
    lastUpdate.current = Date.now();
    setThrottledValue(newValue);
  }, []);

  React.useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastUpdate.current;

    if (elapsed > throttle) {
      updateThrottledValue(value);
      return () => {};
    }

    const delay = throttle - elapsed;
    const timeoutId = setTimeout(() => updateThrottledValue(value), delay);
    return () => clearTimeout(timeoutId);
  }, [value, throttle, updateThrottledValue]);

  const now = Date.now();
  const elapsed = now - lastUpdate.current;

  return elapsed > throttle ? value : throttledValue;
}
