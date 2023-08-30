import { UseQueryResult } from '@tanstack/react-query';
import { NodeId } from '@mui/toolpad-core';
import { createProvidedContext } from '@mui/toolpad-utils/react';
import client from '../api';
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
  const { dataSourceId, connectionId } = useConnectionContext();
  return client.useQuery(
    'dataSourceFetchPrivate',
    query == null ? null : [dataSourceId, connectionId, query],
    options,
  );
}
