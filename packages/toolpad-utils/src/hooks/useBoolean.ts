'use client';
import * as React from 'react';

/**
 * A utility with shortcuts to manipulate boolean values.
 */
export default function useBoolean(initialValue: boolean) {
  const [value, setValue] = React.useState(initialValue);
  const toggle = React.useCallback(() => setValue((existing) => !existing), []);
  const setTrue = React.useCallback(() => setValue(true), []);
  const setFalse = React.useCallback(() => setValue(false), []);
  return { value, setValue, toggle, setTrue, setFalse };
}
