import { Client } from 'pg';
import { ServerDataSource } from '../../types';
import { Maybe } from '../../utils/types';
import {
  PostgresConnectionParams,
  PostgresPrivateQuery,
  PostgresQuery,
  PostgresResult,
} from './types';

async function execBase(
  connection: Maybe<PostgresConnectionParams>,
  postgresQuery: PostgresQuery,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  params: Record<string, string>,
): Promise<PostgresResult> {
  const client = new Client({
    ...connection,
  });
  try {
    await client.connect();
    const res = await client.query(postgresQuery.sql, [
      /* TODO */
    ]);

    return {
      data: res.rows,
    };
  } catch (error: any) {
    return {
      data: [],
      error,
    };
  } finally {
    await client.end();
  }
}

async function exec(
  connection: Maybe<PostgresConnectionParams>,
  postgresQuery: PostgresQuery,
  params: Record<string, string>,
): Promise<PostgresResult> {
  const { data, error } = await execBase(connection, postgresQuery, params);
  if (error) {
    throw error;
  }
  return { data };
}

async function execPrivate(
  connection: Maybe<PostgresConnectionParams>,
  query: PostgresPrivateQuery,
): Promise<any> {
  // eslint-disable-next-line no-console
  console.log(`executing private query "${query}"`);
  if (query.kind === 'debugExec') {
    return execBase(connection, query.query, query.params);
  }
  throw new Error(`Unknown query "${query}"`);
}

const dataSource: ServerDataSource<PostgresConnectionParams, PostgresQuery, any> = {
  execPrivate,
  exec,
};

export default dataSource;
