import * as React from 'react';
import { UseDataProviderHook } from '@mui/toolpad-core/runtime';
import { useQuery } from '@tanstack/react-query';
import invariant from 'invariant';
import { ToolpadDataProviderBase } from '@mui/toolpad-core';
import type { GridRowId } from '@mui/x-data-grid';
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
      return api.methods.introspectDataProvider(filePath, name);
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
        return api.methods.getDataProviderRecords(filePath, name, ...args);
      },
      deleteRecord: introspection.hasDeleteRecord
        ? async (recordId: GridRowId) => {
            invariant(id, 'id is required');
            const [filePath, name] = id.split(':');
            return api.methods.deleteDataProviderRecord(filePath, name, recordId);
          }
        : undefined,
      updateRecord: introspection.hasUpdateRecord
        ? async (recordId: GridRowId, values: Record<string, unknown>) => {
            invariant(id, 'id is required');
            const [filePath, name] = id.split(':');
            return api.methods.updateDataProviderRecord(filePath, name, recordId, values);
          }
        : undefined,
      createRecord: introspection.hasCreateRecord
        ? async (values: Record<string, unknown>) => {
            invariant(id, 'id is required');
            const [filePath, name] = id.split(':');
            return api.methods.createDataProviderRecord(filePath, name, values);
          }
        : undefined,
    };
  }, [id, introspection]);

  return { isLoading, error, dataProvider };
};
