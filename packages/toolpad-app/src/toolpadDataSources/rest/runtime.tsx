import type { Entry } from 'har-format';
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
    const instrumentedFetch = async (...args: Parameters<typeof fetch>) => {
      const req = new Request(...args);
      const res = await window.fetch(req);
      const entry: Entry = {};
      return res;
    };

    return execfetch(fetchQuery, params, {
      connection: null,
      fetchImpl: instrumentedFetch,
      evalExpression,
    });
  }

  return serverFetch(fetchQuery, params);
}

const dataSource: RuntimeDataSource<FetchQuery, FetchResult> = {
  exec: clientExec,
};

export default dataSource;
