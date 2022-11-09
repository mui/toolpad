import { createConnection } from 'mysql2/promise';
import { ServerDataSource } from '../../types';
import { errorFrom } from '../../utils/errors';
import { Maybe } from '../../utils/types';
import { asArray } from '../../utils/collections';
import { SqlConnectionParams, SqlPrivateQuery, SqlQuery, SqlResult } from '../sql/types';
import { SqlExec, SqlExecPrivate } from '../sql/server';

/**
 * Substitute all variables including named paramters ($varName) in a MySQL query with the placeholder '?'
 * and return an array containing the values to replace the placeholders with
 */

interface MySQLQueryConfig {
  mysqlQuery: string;
  substitutions: any[];
}

function prepareQuery(sql: string, params: Record<string, string>): MySQLQueryConfig {
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
    mysqlQuery: sqlWithVarsReplaced,
    substitutions,
  };
}

async function execBase(
  connection: Maybe<SqlConnectionParams>,
  query: SqlQuery,
  params: Record<string, string>,
): Promise<SqlResult> {
  const mysqlConnection = await createConnection({ ...connection });

  try {
    const { mysqlQuery, substitutions } = prepareQuery(query.sql, params);

    const [rows] = await mysqlConnection.execute(mysqlQuery, substitutions);
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

async function exec(
  connection: Maybe<SqlConnectionParams>,
  query: SqlQuery,
  params: Record<string, string>,
): Promise<SqlResult> {
  const { data, error } = await SqlExec(connection, query, params, execBase);
  return { data, error };
}

async function test(connection: Maybe<SqlConnectionParams>): Promise<void> {
  const mysqlConnection = await createConnection({ ...connection });
  mysqlConnection.execute('SELECT 1');
}

async function execPrivate(
  connection: Maybe<SqlConnectionParams>,
  query: SqlPrivateQuery,
): Promise<any> {
  return SqlExecPrivate(connection, query, execBase, test);
}

const dataSource: ServerDataSource<SqlConnectionParams, SqlQuery, any> = {
  execPrivate,
  exec,
};

export default dataSource;
