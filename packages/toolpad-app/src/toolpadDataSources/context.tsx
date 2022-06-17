import { UseQueryResult } from 'react-query';
import { NodeId } from '@mui/toolpad-core';
import { createProvidedContext } from '../utils/react';
import client from '../api';

export interface QueryEditorContext {
  appId: string;
  connectionId: NodeId;
}

const [useQueryEditorContext, QueryEditorContextProvider] =
  createProvidedContext<QueryEditorContext>('QueryEditor');

export { useQueryEditorContext, QueryEditorContextProvider };

export function usePrivateQuery<Q = unknown, R = unknown>(query: Q | null): UseQueryResult<R> {
  const { appId, connectionId } = useQueryEditorContext();
  return client.useQuery(
    'dataSourceFetchPrivate',
    query == null ? null : [appId, connectionId, query],
  );
}
