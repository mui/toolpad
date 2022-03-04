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

async function execPrivate(
  connection: StudioConnection<PostgresConnectionParams>,
  query: any,
): Promise<any> {
  console.log(`executing private query "${query}"`);
  if (query === 'getAllTables') {
    return ['table1', 'table2'];
  }
  throw new Error(`Unknown query "${query}"`);
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
  execPrivate,
  exec,
};

export default dataSource;
