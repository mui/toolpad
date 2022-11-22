import { createConnection } from 'mysql2/promise';
import { errorFrom } from '../../utils/errors';
import { Maybe } from '../../utils/types';
import { asArray } from '../../utils/collections';
import { SqlConnectionParams } from '../sql/types';
import { MySQLQuery, MySQLResult } from './types';
import { createSqlServerDatasource } from '../sql/server';

/**
 * Substitute all variables including named paramters ($varName) in a MySQL query with the placeholder '?'
 * and return an array containing the values to replace the placeholders with
 */

function prepareQuery(sql: string, params: Record<string, string>): MySQLQuery {
  const substitutions: any[] = [];
  const sqlWithVarsReplaced = sql.replaceAll(
    // eslint-disable-next-line no-useless-escape
    /(?<==|<|<=|>|>=|<>)[ ]*(([\$\w\d]*\b)|([']+[\w ]+['][ ]*))|(;)/g,
    (match) => {
      const trimmedMatch = match.trim().replaceAll(/[']+/g, '');
      if (trimmedMatch[0] === '$') {
        const varName = trimmedMatch.slice(1);
        if (params[varName]) {
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
  query: MySQLQuery,
  params: Record<string, string>,
): Promise<MySQLResult> {
  const mysqlConnection = await createConnection({ ...connection });

  try {
    const { sql, substitutions } = prepareQuery(query.sql, params);

    const [rows] = await mysqlConnection.execute(sql, substitutions);
    return {
      // @ts-expect-error - TODO: Fix this asArray type error
      data: asArray(rows),
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

export default createSqlServerDatasource<SqlConnectionParams, MySQLQuery>({
  execSql,
  testConnection,
});
