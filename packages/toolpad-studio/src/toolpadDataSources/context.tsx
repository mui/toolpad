import { UseQueryResult } from '@tanstack/react-query';
import { NodeId } from '@toolpad/studio-runtime';
import { createProvidedContext } from '@toolpad/utils/react';
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
