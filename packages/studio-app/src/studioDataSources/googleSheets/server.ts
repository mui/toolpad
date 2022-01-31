import {
  StudioApiResult,
  StudioDataSourceServer,
  ConnectionStatus,
  StudioConnection,
} from '../../types';
import { GoogleSheetsConnectionParams, PostgresQuery } from './types';

async function test(
  connection: StudioConnection<GoogleSheetsConnectionParams>,
): Promise<ConnectionStatus> {
  console.log(`Testing connection ${JSON.stringify(connection)}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { timestamp: Date.now() };
}

async function exec(
  connection: StudioConnection<GoogleSheetsConnectionParams>,
  postgresQuery: PostgresQuery,
): Promise<StudioApiResult<any>> {
  console.log(
    `executing "${postgresQuery.text}" with "${postgresQuery.params}" on "${connection.params.clientId}"`,
  );
  return {
    fields: {},
    data: [],
  };
}

const dataSource: StudioDataSourceServer<GoogleSheetsConnectionParams, PostgresQuery, any> = {
  test,
  exec,
};

export default dataSource;
