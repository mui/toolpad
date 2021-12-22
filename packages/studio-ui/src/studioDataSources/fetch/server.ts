import { ConnectionStatus, StudioDataSourceServer, StudioQueryResult } from '../../types';
import { FetchQuery } from './types';

async function test(): Promise<ConnectionStatus> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { timestamp: Date.now() };
}

async function query(connection: {}, fetchQuery: FetchQuery): Promise<StudioQueryResult<any>> {
  const res = await fetch(fetchQuery.url, fetchQuery);
  return res.json();
}

const dataSource: StudioDataSourceServer<{}, FetchQuery, any> = {
  test,
  query,
};

export default dataSource;
