import { errorFrom } from '../../utils/errors';
import { ServerDataSource } from '../../types';
import { SqlServerProps, SqlPrivateQuery } from './types';

export function createSqlServerDatasource<P, Q>({
  execSql,
  testConnection,
}: SqlServerProps<P, Q>): ServerDataSource<P, Q, SqlPrivateQuery<P, Q>> {
  return {
    exec: async (connection, query, params) => {
      const { data, error } = await execSql(connection, query, params);
      return { data, error };
    },
    execPrivate: async (connection, query) => {
      switch (query.kind) {
        case 'debugExec':
          return execSql(connection, query.query, query.params);
        case 'connectionStatus': {
          try {
            testConnection(query.params);
            return { error: null };
          } catch (rawError) {
            const error = errorFrom(rawError);
            return { error: error.message };
          }
        }
        default:
          throw new Error(`Unknown query "${(query as SqlPrivateQuery<P, Q>).kind}"`);
      }
    },
  };
}
