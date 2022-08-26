import * as React from 'react';
import { useConnectionContext } from './context';
import client from '../api';

export default function useFetchPrivate<PQ, R>(): (privateQuery: PQ) => Promise<R> {
  const { appId, dataSourceId, connectionId } = useConnectionContext();
  return React.useCallback(
    (privateQuery: PQ) =>
      client.query.dataSourceFetchPrivate(appId, dataSourceId, connectionId, privateQuery),
    [appId, connectionId, dataSourceId],
  );
}
