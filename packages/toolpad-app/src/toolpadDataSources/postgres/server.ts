import { Client, QueryConfig } from 'pg';
import { mergeConnectionModel } from '../../server/secrets';
import { ConnectionData, ServerDataSource } from '../../types';
import { errorFrom } from '../../utils/errors';
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
  if (!connection?.password) {
    // pg client doesn't support passwordless authentication atm
    // See https://github.com/brianc/node-postgres/issues/1927
    throw new Error(`Password required`);
  }

  const client = new Client({ ...connection });
  const paramEntries = Object.entries(params);
  try {
    await client.connect();

    const pgQuery = parseQuery(postgresQuery.sql, paramEntries);

    const res = await client.query(pgQuery);

    return {
      data: res.rows,
    };
  } catch (rawError) {
    const error = errorFrom(rawError);
    error.message = parseErrorMessage(error.message, paramEntries);
    throw error;
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
  return { data, error };
}

async function execPrivate(
  connection: Maybe<PostgresConnectionParams>,
  query: PostgresPrivateQuery,
): Promise<any> {
  switch (query.kind) {
    case 'debugExec':
      return execBase(connection, query.query, query.params);
    case 'connectionStatus': {
      try {
        const client = new Client({ ...query.params });
        await client.connect();
        await client.query('SELECT * FROM version();');
        return { error: null };
      } catch (rawError) {
        const err = errorFrom(rawError);
        return { error: err.message };
      }
    }
    default:
      throw new Error(`Unknown query "${(query as PostgresPrivateQuery).kind}"`);
  }
}

async function globalConnectionExecPrivate(
  connection: Maybe<ConnectionData<PostgresConnectionParams>>,
  query: PostgresPrivateQuery,
): Promise<any> {
  switch (query.kind) {
    case 'connectionStatus2': {
      try {
        const { params, secrets } = mergeConnectionModel(connection, query.value);
        const client = new Client({ ...params, ...secrets });
        await client.connect();
        await client.query('SELECT * FROM version();');
        return { error: null };
      } catch (rawError) {
        const err = errorFrom(rawError);
        return { error: err.message };
      }
    }
    default:
      throw new Error(`Unknown query "${(query as PostgresPrivateQuery).kind}"`);
  }
}

const dataSource: ServerDataSource<PostgresConnectionParams, PostgresQuery, any> = {
  globalConnectionExecPrivate,
  execPrivate,
  exec,
};

export default dataSource;
