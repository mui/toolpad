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
  console.log(`Testing connection ${JSON.stringify(connection)}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { timestamp: Date.now() };
}

async function query(
  connection: StudioConnection<PostgresConnectionParams>,
  postgresQuery: PostgresQuery,
): Promise<StudioQueryResult<any>> {
  console.log(
    `executing "${postgresQuery.text}" with "${postgresQuery.params}" on "${connection.params.host}"`,
  );
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
