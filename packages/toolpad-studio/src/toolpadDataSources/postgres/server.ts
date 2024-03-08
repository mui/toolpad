import pg from 'pg';
import { errorFrom } from '@toolpad/utils/errors';
import { Maybe } from '@toolpad/utils/types';
import { SqlConnectionParams, SqlQuery, SqlResult } from '../sql/types';
import { createSqlServerDatasource } from '../sql/server';

const { Client } = pg;

/**
 * Substitute named parameters ($varName) in a postgres query with their positional parameter ($1)
 */
function parseQuery(sql: string, params: [string, any][]): pg.QueryConfig {
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

async function execSql(
  connection: Maybe<SqlConnectionParams>,
  postgresQuery: SqlQuery,
  params: Record<string, string>,
): Promise<SqlResult> {
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
      info:
        res.command !== 'SELECT'
          ? `OK ${res.command}, ${res.rowCount} ${res.rowCount === 1 ? 'row' : 'rows'} affected`
          : undefined,
    };
  } catch (rawError) {
    const error = errorFrom(rawError);
    error.message = parseErrorMessage(error.message, paramEntries);
    throw error;
  } finally {
    await client.end();
  }
}

const testConnection = async (connection: Maybe<SqlConnectionParams>) => {
  const client = new Client({ ...connection });
  await client.connect();
  await client.query('SELECT * FROM version();');
};

export default createSqlServerDatasource<SqlConnectionParams, SqlQuery>({
  execSql,
  testConnection,
});
