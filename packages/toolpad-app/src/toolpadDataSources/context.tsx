import * as React from 'react';
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

export interface GlobalConnectionContext {
  dataSourceId: string;
  connectionId: string | null;
}

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

export function useFetchPrivate<PQ, R>(): (privateQuery: PQ) => Promise<R> {
  const { appId, dataSourceId, connectionId } = useConnectionContext();
  return React.useCallback(
    (privateQuery: PQ) =>
      client.query.dataSourceFetchPrivate(appId, dataSourceId, connectionId, privateQuery),
    [appId, connectionId, dataSourceId],
  );
}

export function useGobalConnectionPrivateQuery<Q = unknown, R = unknown>(
  query: Q | null,
  options?: UseQueryFnOptions<any>,
): UseQueryResult<R> {
  const { dataSourceId, connectionId } = useGlobalConnectionContext();
  return client.useQuery(
    'globalConnectionFetchPrivate',
    query == null ? null : [{ dataSourceId, connectionId }, query],
    options,
  );
}

export function useGlobalConnectionFetchPrivate<PQ, R>(): (privateQuery: PQ) => Promise<R> {
  const { dataSourceId, connectionId } = useGlobalConnectionContext();
  return React.useCallback(
    (privateQuery: PQ) =>
      client.query.globalConnectionFetchPrivate({ dataSourceId, connectionId }, privateQuery),
    [connectionId, dataSourceId],
  );
}
