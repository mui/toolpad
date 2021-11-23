import * as React from 'react';

export default function useLatest<T>(value: T | null | undefined): T | null | undefined {
  const valueRef = React.useRef(value);
  if (value !== null && value !== undefined) {
    valueRef.current = value;
  }
  return valueRef.current;
}
