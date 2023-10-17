import * as React from 'react';
import { useConnectionContext } from './context';
import { useProjectApi } from '../projectApi';

export default function useFetchPrivate<PQ, R>(): (privateQuery: PQ) => Promise<R> {
  const projectApi = useProjectApi();
  const { dataSourceId, connectionId } = useConnectionContext();
  return React.useCallback(
    (privateQuery: PQ) =>
      projectApi.methods.dataSourceFetchPrivate(dataSourceId, connectionId, privateQuery),
    [projectApi, connectionId, dataSourceId],
  );
}
