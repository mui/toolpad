import * as React from 'react';

export function useInput<O, K extends keyof O>(
  object: O,
  setObject: (newValue: O) => void,
  key: K,
) {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setObject({ ...object, [key]: event.target.value });
    },
    [setObject, key, object],
  );
  return {
    value: object[key],
    onChange: handleChange,
  };
}
