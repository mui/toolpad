import { ExecFetchFn, RuntimeDataSource } from '../../types';
import { FetchQuery, FetchResult } from './types';
import { execfetch } from './shared';
import evalExpression from '../../utils/evalExpression';

export async function clientExec(
  fetchQuery: FetchQuery,
  params: Record<string, string>,
  serverFetch: ExecFetchFn<FetchQuery, FetchResult>,
): Promise<FetchResult> {
  if (fetchQuery.browser) {
    return execfetch(fetchQuery, params, {
      connection: null,
      fetchImpl: window.fetch as any,
      evalExpression,
    });
  }

  return serverFetch(fetchQuery, params);
}

const dataSource: RuntimeDataSource<FetchQuery, FetchResult> = {
  exec: clientExec,
};

export default dataSource;
