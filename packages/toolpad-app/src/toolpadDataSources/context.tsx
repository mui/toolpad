import { UseQueryResult } from 'react-query';
import { NodeId } from '@mui/toolpad-core';
import { createProvidedContext } from '../utils/react';
import client from '../api';

export interface ConnectionContext {
  appId: string;
  connectionId: NodeId;
}

const [useConnectionContext, ConnectionContextProvider] =
  createProvidedContext<ConnectionContext>('QueryEditor');

export { useConnectionContext, ConnectionContextProvider };

export function usePrivateQuery<Q = unknown, R = unknown>(
  query: Q | null,
  retry?: boolean | number,
): UseQueryResult<R> {
  const { appId, connectionId } = useConnectionContext();
  return client.useQuery(
    'dataSourceFetchPrivate',
    query == null ? null : [appId, connectionId, query],
    { retry: retry ?? 3 },
  );
}
