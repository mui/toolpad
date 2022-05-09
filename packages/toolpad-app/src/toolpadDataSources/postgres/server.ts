import { ApiResult, ServerDataSource, ConnectionStatus, LegacyConnection } from '../../types';
import { PostgresConnectionParams, PostgresQuery } from './types';

async function test(
  connection: LegacyConnection<PostgresConnectionParams>,
): Promise<ConnectionStatus> {
  // eslint-disable-next-line no-console
  console.log(`Testing connection ${JSON.stringify(connection)}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { timestamp: Date.now() };
}

async function execPrivate(
  connection: LegacyConnection<PostgresConnectionParams>,
  query: any,
): Promise<any> {
  // eslint-disable-next-line no-console
  console.log(`executing private query "${query}"`);
  if (query === 'getAllTables') {
    return ['table1', 'table2'];
  }
  throw new Error(`Unknown query "${query}"`);
}

async function exec(
  connection: LegacyConnection<PostgresConnectionParams>,
  postgresQuery: PostgresQuery,
): Promise<ApiResult<any>> {
  // eslint-disable-next-line no-console
  console.log(
    `executing "${postgresQuery.text}" with "${postgresQuery.params}" on "${connection.params.host}"`,
  );
  return {
    data: [],
  };
}

const dataSource: ServerDataSource<PostgresConnectionParams, PostgresQuery, any> = {
  test,
  execPrivate,
  exec,
};

export default dataSource;
