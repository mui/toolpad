import { ExecFetchResult } from '@mui/toolpad-core';
import type { Maybe, WithControlledProp } from '../../utils/types';

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

export interface SqlResult extends ExecFetchResult<any[]> {}

export interface SqlConnectionStatus {
  error: string | null;
}

export type SqlExecBase = (
  connection: Maybe<SqlConnectionParams>,
  query: SqlQuery,
  params: Record<string, string>,
) => Promise<SqlResult>;

export interface SqlPrivateQueryDebugExec {
  kind: 'debugExec';
  query: SqlQuery;
  params: Record<string, any>;
}

export interface SqlPrivateQueryConnectionStatus {
  kind: 'connectionStatus';
  params: SqlConnectionParams;
}

export interface SqlConnectionEditorProps<P> extends WithControlledProp<P | null> {
  defaultPort: number;
}

export type SqlPrivateQuery = SqlPrivateQueryDebugExec | SqlPrivateQueryConnectionStatus;
