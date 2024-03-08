import { createConnection, OkPacket, ResultSetHeader } from 'mysql2/promise';
import { errorFrom } from '@toolpad/utils/errors';
import { Maybe } from '@toolpad/utils/types';
import { SqlConnectionParams, SqlQuery, SqlResult } from '../sql/types';
import { createSqlServerDatasource } from '../sql/server';

/**
 * Substitute all variables including named paramters ($varName) in a MySQL query with the placeholder '?'
 * and return an array containing the values to replace the placeholders with
 */

function prepareQuery(sql: string, params: Record<string, string>) {
  const substitutions: any[] = [];
  const sqlWithVarsReplaced = sql.replaceAll(
    // eslint-disable-next-line no-useless-escape
    /(?<==|<|<=|>|>=|<>)[ ]*(([\$\w\d]*\b)|([']+[\w ]+['][ ]*))|(;)/g,
    (match) => {
      const trimmedMatch = match.trim().replaceAll(/[']+/g, '');
      if (trimmedMatch[0] === '$') {
        const varName = trimmedMatch.slice(1);
        if (typeof params[varName] !== 'undefined') {
          substitutions.push(params[varName]);
        }
        return '?';
      }
      if (trimmedMatch === ';') {
        return '';
      }
      substitutions.push(trimmedMatch);
      return '?';
    },
  );
  return {
    sql: sqlWithVarsReplaced,
    substitutions,
  };
}

async function execSql(
  connection: Maybe<SqlConnectionParams>,
  query: SqlQuery,
  params: Record<string, string>,
): Promise<SqlResult> {
  const mysqlConnection = await createConnection({ ...connection });

  try {
    const { sql, substitutions } = prepareQuery(query.sql, params);

    const [result] = await mysqlConnection.execute(sql, substitutions);

    let rows: any[] = [];
    let info: string | undefined;

    if (Array.isArray(result)) {
      rows = result;
    } else {
      info = (result as ResultSetHeader).info || (result as OkPacket).message;
    }

    return {
      data: rows,
      info,
    };
  } catch (rawError) {
    const error = errorFrom(rawError);
    throw error;
  } finally {
    await mysqlConnection.end();
  }
}

async function testConnection(connection: Maybe<SqlConnectionParams>): Promise<void> {
  const mysqlConnection = await createConnection({ ...connection });
  mysqlConnection.execute('SELECT 1');
}

export default createSqlServerDatasource<SqlConnectionParams, SqlQuery>({
  execSql,
  testConnection,
});
