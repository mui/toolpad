import { errorFrom } from '../../utils/errors';
import { Maybe } from '../../utils/types';
import { SqlConnectionParams, SqlExecBase, SqlPrivateQuery, SqlQuery, SqlResult } from './types';

export async function SqlExec(
  connection: Maybe<SqlConnectionParams>,
  postgresQuery: SqlQuery,
  params: Record<string, string>,
  execBase: SqlExecBase,
): Promise<SqlResult> {
  const { data, error } = await execBase(connection, postgresQuery, params);
  return { data, error };
}

export async function SqlExecPrivate(
  connection: Maybe<SqlConnectionParams>,
  query: SqlPrivateQuery,
  execBase: SqlExecBase,
  test: (connection: Maybe<SqlConnectionParams>) => void,
): Promise<any> {
  switch (query.kind) {
    case 'debugExec':
      return execBase(connection, query.query, query.params);
    case 'connectionStatus': {
      try {
        await test(query.params);
        return { error: null };
      } catch (rawError) {
        const err = errorFrom(rawError);
        return { error: err.message };
      }
    }
    default:
      throw new Error(`Unknown query "${(query as SqlPrivateQuery).kind}"`);
  }
}
