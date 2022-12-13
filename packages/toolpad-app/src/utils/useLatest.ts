import * as React from 'react';

/**
 * Returns the latest non-null, non-undefiend value that has been passed to it.
 */
function useLatest<T>(value: T): T;
function useLatest<T>(value: T | null | undefined): T | null | undefined;
function useLatest<T>(value: T | null | undefined): T | null | undefined {
  const valueRef = React.useRef(value);
  React.useEffect(() => {
    if (value !== null && value !== undefined) {
      valueRef.current = value;
    }
  }, [value]);
  return value ?? valueRef.current;
}

export default useLatest;
