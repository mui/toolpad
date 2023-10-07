import * as React from 'react';
import { useConnectionContext } from './context';
import client from '../api';

export default function useFetchPrivate<PQ, R>(): (privateQuery: PQ) => Promise<R> {
  const { dataSourceId, connectionId } = useConnectionContext();
  return React.useCallback(
    (privateQuery: PQ) =>
      client.methods.dataSourceFetchPrivate(dataSourceId, connectionId, privateQuery),
    [connectionId, dataSourceId],
  );
}
