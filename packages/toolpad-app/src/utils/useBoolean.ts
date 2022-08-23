import * as React from 'react';

export default function useBoolean(initialValue: boolean) {
  const [value, setValue] = React.useState(initialValue);
  const toggle = React.useCallback(() => setValue((existing) => !!existing), []);
  const set = React.useCallback(() => setValue(true), []);
  const reset = React.useCallback(() => setValue(false), []);
  return { value, setValue, toggle, set, reset };
}
