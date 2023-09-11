import * as React from 'react';
import { UseDataProviderHook } from '@mui/toolpad-core/runtime';
import { useQuery } from '@tanstack/react-query';
import invariant from 'invariant';
import api from './api';

export const useDataProvider: UseDataProviderHook = (id) => {
  const {
    isLoading,
    error,
    data: introspection,
  } = useQuery({
    queryKey: ['introspectDataProvider', id],
    enabled: !!id,
    queryFn: async () => {
      invariant(id, 'id is required');
      const [filePath, name] = id.split(':');
      return api.query.introspectDataProvider(filePath, name);
    },
  });
  console.log(introspection);
  return { isLoading, error };
};
