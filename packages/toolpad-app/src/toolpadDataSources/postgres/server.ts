import { Client, QueryConfig } from 'pg';
import { ServerDataSource } from '../../types';
import { Maybe } from '../../utils/types';
import {
  PostgresConnectionParams,
  PostgresPrivateQuery,
  PostgresQuery,
  PostgresResult,
} from './types';

/**
 * Substitute named parameters ($varName) in a postgres query with their positional parameter ($1)
 */
function parseQuery(sql: string, params: [string, any][]): QueryConfig {
  const substitutions = new Map(params.map(([name], i) => [name.toLowerCase(), i + 1]));
  const sqlWithNamedVars = sql.replaceAll(/\$([a-zA-Z][a-zA-Z0-9]*)/g, (match, varName) => {
    const index = substitutions.get(varName.toLowerCase());
    if (typeof index === 'number') {
      return `$${index}`;
    }
    return match;
  });

  return {
    text: sqlWithNamedVars,
    values: params.map(([, value]) => value),
  };
}

/**
 * Augment variables ($1, $2,...) in an error message with their name "$varName($1)"
 */
function parseErrorMessage(msg: string, params: [string, any][]): string {
  const substitutions = new Map(params.map(([name], i) => [i + 1, name]));
  const msgWithNamedVars = msg.replaceAll(/\$(\d+)/g, (match, index) => {
    const varName = substitutions.get(Number(index));
    if (typeof varName === 'string') {
      return `$${varName}(${match})`;
    }
    return match;
  });

  return msgWithNamedVars;
}

async function execBase(
  connection: Maybe<PostgresConnectionParams>,
  postgresQuery: PostgresQuery,
  params: Record<string, string>,
): Promise<PostgresResult> {
  const client = new Client({
    ...connection,
  });
  const paramEntries = Object.entries(params);
  try {
    await client.connect();

    const res = await client.query(parseQuery(postgresQuery.sql, paramEntries));

    return {
      data: res.rows,
    };
  } catch (error: any) {
    error.message = parseErrorMessage(error.message, paramEntries);
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
