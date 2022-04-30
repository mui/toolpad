import { ConnectionStatus, ServerDataSource, ApiResult } from '../../types';
import { FetchQuery, RestConnectionParams } from './types';
import evalBindableInRuntime from '../../server/evalBindableInRuntime';

async function test(): Promise<ConnectionStatus> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { timestamp: Date.now() };
}

async function exec(
  connection: RestConnectionParams,
  fetchQuery: FetchQuery,
  params: Record<string, string>,
): Promise<ApiResult<any>> {
  const boundValues = { ...fetchQuery.params, ...params };
  const resolvedUrl = await evalBindableInRuntime(fetchQuery.url, { query: boundValues });
  const res = await fetch(resolvedUrl.value);
  const data = await res.json();
  return { data };
}

const dataSource: ServerDataSource<{}, FetchQuery, any> = {
  test,
  exec,
};

export default dataSource;
