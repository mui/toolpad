import { UseQueryResult } from '@tanstack/react-query';
import { NodeId } from '@mui/toolpad-studio-core';
import { createProvidedContext } from '@mui/toolpad-studio-utils/react';
import { useProjectApi } from '../projectApi';
import { UseQueryFnOptions } from '../rpcClient';

export interface ConnectionContext {
  dataSourceId: string;
  connectionId: NodeId | null;
}

const [useConnectionContext, ConnectionContextProvider] =
  createProvidedContext<ConnectionContext>('QueryEditor');

export { useConnectionContext, ConnectionContextProvider };

export function usePrivateQuery<Q = unknown, R = unknown>(
  query: Q | null,
  options?: UseQueryFnOptions<any>,
): UseQueryResult<R> {
  const projectApi = useProjectApi();
  const { dataSourceId, connectionId } = useConnectionContext();
  return projectApi.useQuery(
    'dataSourceFetchPrivate',
    query == null ? null : [dataSourceId, connectionId, query],
    options,
  );
}
