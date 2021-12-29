import { ConnectionStatus, StudioDataSourceServer, StudioApiResult } from '../../types';
import { FetchQuery } from './types';

async function test(): Promise<ConnectionStatus> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { timestamp: Date.now() };
}

async function exec(connection: {}, fetchQuery: FetchQuery): Promise<StudioApiResult<any>> {
  const res = await fetch(fetchQuery.url, fetchQuery);
  return res.json();
}

const dataSource: StudioDataSourceServer<{}, FetchQuery, any> = {
  test,
  exec,
};

export default dataSource;
