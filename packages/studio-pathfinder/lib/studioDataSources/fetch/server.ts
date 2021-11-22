import { ConnectionStatus, StudioDataSourceServer, StudioQueryResult } from '../../types';
import { FetchQuery } from './types';

async function test(connection: {}): Promise<ConnectionStatus> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { timestamp: Date.now() };
}

async function query(connection: {}, query: FetchQuery): Promise<StudioQueryResult<any>> {
  const res = await fetch(query.url, query);
  return res.json();
}

const dataSource: StudioDataSourceServer<{}, FetchQuery, any> = {
  test,
  query,
};

export default dataSource;
