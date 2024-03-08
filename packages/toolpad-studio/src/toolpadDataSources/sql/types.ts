import { ExecFetchResult } from '@toolpad/studio-runtime';
import type { Maybe, WithControlledProp } from '@toolpad/utils/types';

export interface SqlConnectionParams {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface SqlQuery {
  sql: string;
}

export interface SqlResult extends ExecFetchResult {
  info?: string;
}

export interface SqlConnectionEditorProps<P> extends WithControlledProp<P | null> {
  defaultPort: number;
}

export interface SqlConnectionStatus {
  status: 'success' | 'disconnected' | 'connecting' | 'error';
  error?: string;
}

export interface SqlPrivateQueryDebugExec<Q> {
  kind: 'debugExec';
  query: Q;
  params: Record<string, any>;
}

export interface SqlPrivateQueryConnectionStatus<P> {
  kind: 'connectionStatus';
  params: Maybe<P>;
}

export type SqlPrivateQuery<P, Q> =
  | SqlPrivateQueryDebugExec<Q>
  | SqlPrivateQueryConnectionStatus<P>;

type SqlExecBase<P, Q> = (
  connection: Maybe<P>,
  query: Q,
  params: Record<string, string>,
) => Promise<ExecFetchResult>;

export interface SqlServerProps<P, Q> {
  execSql: SqlExecBase<P, Q>;
  testConnection: (connection: Maybe<P>) => void;
  tablesQuery?: string;
}
