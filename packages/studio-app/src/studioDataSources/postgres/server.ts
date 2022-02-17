import {
  StudioApiResult,
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

async function exec(
  connection: StudioConnection<PostgresConnectionParams>,
  postgresQuery: PostgresQuery,
): Promise<StudioApiResult<any>> {
  console.log(
    `executing "${postgresQuery.text}" with "${postgresQuery.params}" on "${connection.params.host}"`,
  );
  return {
    data: [],
  };
}

const dataSource: StudioDataSourceServer<PostgresConnectionParams, PostgresQuery, any> = {
  test,
  exec,
  createHandler: null,
};

export default dataSource;
