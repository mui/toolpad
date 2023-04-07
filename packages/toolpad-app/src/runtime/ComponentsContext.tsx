import * as React from 'react';
import { createComponent, useComponents } from '@mui/toolpad-core';

function createToolpadComponentThatThrows(error: Error) {
  return createComponent(() => {
    throw error;
  });
}

export { useComponents };

export function useComponent(id: string) {
  const components = useComponents();
  return React.useMemo(() => {
    return (
      components?.[id] ??
      createToolpadComponentThatThrows(new Error(`Can't find component for "${id}"`))
    );
  }, [components, id]);
}
