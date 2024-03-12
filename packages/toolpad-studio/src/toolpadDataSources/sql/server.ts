import { serializeError, errorFrom } from '@toolpad/utils/errors';
import { ServerDataSource } from '../../types';
import { SqlServerProps, SqlPrivateQuery, SqlConnectionStatus } from './types';

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
          let connectionStatus: SqlConnectionStatus;
          try {
            await testConnection(query.params);
            connectionStatus = { status: 'success' };
            return { data: connectionStatus };
          } catch (rawError) {
            const serializedError = serializeError(errorFrom(rawError));
            connectionStatus = {
              status: 'error',
              error: serializedError.message,
            };
            return { data: connectionStatus, error: serializedError };
          }
        }
        default:
          throw new Error(`Unknown query "${(query as SqlPrivateQuery<P, Q>).kind}"`);
      }
    },
    api: {},
  };
}
