import {
  StudioQueryResult,
  StudioDataSourceServer,
  ConnectionStatus,
  StudioConnection,
} from '../../types';
import { PostgresConnectionParams, PostgresQuery } from './types';

async function test(
  connection: StudioConnection<PostgresConnectionParams>,
): Promise<ConnectionStatus> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { timestamp: Date.now() };
}

async function query(
  connection: StudioConnection<PostgresConnectionParams>,
  query: PostgresQuery,
): Promise<StudioQueryResult<any>> {
  console.log(`executing "${query.text}" with "${query.params}" on "${connection.params.host}"`);
  return {
    fields: {},
    data: [],
  };
}

const dataSource: StudioDataSourceServer<PostgresConnectionParams, PostgresQuery, any> = {
  test,
  query,
};

export default dataSource;
