'use client';
import * as React from 'react';

/**
 * Returns the latest non-null, non-undefined value that has been passed to it.
 */
function useLatest<T>(value: T): T;
function useLatest<T>(value: T | null | undefined): T | null | undefined;
function useLatest<T>(value: T | null | undefined): T | null | undefined {
  const [latest, setLatest] = React.useState<T | null | undefined>(value);
  if (latest !== value && value !== null && value !== undefined) {
    setLatest(value);
  }
  return value ?? latest;
}

export default useLatest;
