import { ApiResult, ServerDataSource } from '../../types';
import { PostgresConnectionParams, PostgresQuery } from './types';

async function execPrivate(connection: PostgresConnectionParams, query: any): Promise<any> {
  // eslint-disable-next-line no-console
  console.log(`executing private query "${query}"`);
  if (query === 'getAllTables') {
    return ['table1', 'table2'];
  }
  throw new Error(`Unknown query "${query}"`);
}

async function exec(
  connection: PostgresConnectionParams,
  postgresQuery: PostgresQuery,
): Promise<ApiResult<any>> {
  // eslint-disable-next-line no-console
  console.log(
    `executing "${postgresQuery.text}" with "${postgresQuery.params}" on "${connection.host}"`,
  );
  return {
    data: [],
  };
}

const dataSource: ServerDataSource<PostgresConnectionParams, PostgresQuery, any> = {
  execPrivate,
  exec,
};

export default dataSource;
