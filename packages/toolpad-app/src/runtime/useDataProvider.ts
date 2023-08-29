import * as React from 'react';
import { UseDataProviderHook } from '@mui/toolpad-core/runtime';
import { useQuery } from '@tanstack/react-query';

export const useDataProvider: UseDataProviderHook = (id) => {
  const { isLoading, error, data: introspection } = useQuery('dataProviderIntrospect', [id]);
  return { isLoading, error };
};
