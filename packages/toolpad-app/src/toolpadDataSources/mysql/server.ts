import { createConnection } from 'mysql2/promise';
import { ServerDataSource } from '../../types';
import { errorFrom } from '../../utils/errors';
import { Maybe } from '../../utils/types';
import {
  MySQLConnectionParams,
  MySQLPrivateQuery,
  MySQLQueryConfig,
  MySQLQuery,
  MySQLResult,
} from './types';
import { asArray } from '../../utils/collections';

/**
 * Substitute all variables including named paramters ($varName) in a MySQL query with the placeholder '?'
 * and return an array containing the values to replace the placeholders with
 */

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
  connection: Maybe<MySQLConnectionParams>,
  query: MySQLQuery,
  params: Record<string, string>,
): Promise<MySQLResult> {
  if (!connection?.password) {
    throw new Error(`Password required`);
  }
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
  connection: Maybe<MySQLConnectionParams>,
  postgresQuery: MySQLQuery,
  params: Record<string, string>,
): Promise<MySQLResult> {
  const { data, error } = await execBase(connection, postgresQuery, params);
  return { data, error };
}

async function execPrivate(
  connection: Maybe<MySQLConnectionParams>,
  query: MySQLPrivateQuery,
): Promise<any>;
async function execPrivate(
  connection: Maybe<MySQLConnectionParams>,
  query: MySQLPrivateQuery,
): Promise<any> {
  switch (query.kind) {
    case 'debugExec':
      return execBase(connection, query.query, query.params);
    case 'connectionStatus': {
      const mysqlConnection = await createConnection({ ...query.params });
      try {
        await mysqlConnection.execute('SELECT 1');
        return { error: null };
      } catch (rawError) {
        const err = errorFrom(rawError);
        return { error: err.message };
      } finally {
        mysqlConnection.end();
      }
    }
    default:
      throw new Error(`Unknown query "${(query as MySQLPrivateQuery).kind}"`);
  }
}

const dataSource: ServerDataSource<MySQLConnectionParams, MySQLQuery, any> = {
  execPrivate,
  exec,
};

export default dataSource;
