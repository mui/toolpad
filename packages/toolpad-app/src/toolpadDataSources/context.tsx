import { UseQueryResult } from '@tanstack/react-query';
import { NodeId } from '@mui/toolpad-core';
import { createProvidedContext } from '../utils/react';
import client, { UseQueryFnOptions } from '../api';

export interface ConnectionContext {
  appId: string;
  dataSourceId: string;
  connectionId: NodeId | null;
}

const [useConnectionContext, ConnectionContextProvider] =
  createProvidedContext<ConnectionContext>('QueryEditor');

export { useConnectionContext, ConnectionContextProvider };

const [useGlobalConnectionContext, GlobalConnectionContextProvider] =
  createProvidedContext<GlobalConnectionContext>('GlobalConnectionContext');

export { useGlobalConnectionContext, GlobalConnectionContextProvider };

export function usePrivateQuery<Q = unknown, R = unknown>(
  query: Q | null,
  options?: UseQueryFnOptions<any>,
): UseQueryResult<R> {
  const { appId, dataSourceId, connectionId } = useConnectionContext();
  return client.useQuery(
    'dataSourceFetchPrivate',
    query == null ? null : [appId, dataSourceId, connectionId, query],
    options,
  );
}

export function useGobalConnectionPrivateQuery<Q = unknown, R = unknown>(
  query: Q | null,
  options?: UseQueryFnOptions<any> & { connectionId: boolean },
): UseQueryResult<R> {
  const { dataSourceId, connectionId } = useConnectionContext();
  return client.useQuery(
    'dataSourceFetchPrivate',
    query == null ? null : [dataSourceId, connectionId, query],
    options,
  );
}
