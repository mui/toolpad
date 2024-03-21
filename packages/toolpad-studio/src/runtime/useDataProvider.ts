import * as React from 'react';
import { UseDataProviderHook } from '@toolpad/studio-runtime/runtime';
import { useQuery } from '@tanstack/react-query';
import invariant from 'invariant';
import { ToolpadDataProviderBase } from '@toolpad/studio-runtime';
import type { GridRowId } from '@mui/x-data-grid';
import { useNonNullableContext } from '@toolpad/utils/react';
import { RuntimeApiContext } from './api';

export const useDataProvider: UseDataProviderHook = (id) => {
  const runtimeApi = useNonNullableContext(RuntimeApiContext);

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
      return runtimeApi.methods.introspectDataProvider(filePath, name);
    },
  });

  const dataProvider: ToolpadDataProviderBase<any, any> | null = React.useMemo(() => {
    if (!introspection) {
      return null;
    }
    return {
      paginationMode: introspection.paginationMode,
      getRecords: async (...args) => {
        invariant(id, 'id is required');
        const [filePath, name] = id.split(':');
        return runtimeApi.methods.getDataProviderRecords(filePath, name, ...args);
      },
      deleteRecord: introspection.hasDeleteRecord
        ? async (recordId: GridRowId) => {
            invariant(id, 'id is required');
            const [filePath, name] = id.split(':');
            return runtimeApi.methods.deleteDataProviderRecord(filePath, name, recordId);
          }
        : undefined,
      updateRecord: introspection.hasUpdateRecord
        ? async (recordId: GridRowId, values: Record<string, unknown>) => {
            invariant(id, 'id is required');
            const [filePath, name] = id.split(':');
            return runtimeApi.methods.updateDataProviderRecord(filePath, name, recordId, values);
          }
        : undefined,
      createRecord: introspection.hasCreateRecord
        ? async (values: Record<string, unknown>) => {
            invariant(id, 'id is required');
            const [filePath, name] = id.split(':');
            return runtimeApi.methods.createDataProviderRecord(filePath, name, values);
          }
        : undefined,
    };
  }, [id, introspection, runtimeApi]);

  return { isLoading, error, dataProvider };
};
