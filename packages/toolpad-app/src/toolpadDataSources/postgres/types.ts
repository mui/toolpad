import { ExecFetchResult } from '@mui/toolpad-core';
import { ConnectionEditorModel } from '../../types';

export interface PostgresConnectionParams {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface PostgresQuery {
  sql: string;
}

export interface PostgresResult extends ExecFetchResult<any[]> {}

export interface PostgresConnectionStatus {
  error: string | null;
}

export interface PostgresPrivateQueryDebugExec {
  kind: 'debugExec';
  query: PostgresQuery;
  params: Record<string, any>;
}

export interface PostgresPrivateQueryConnectionStatus {
  kind: 'connectionStatus';
  params: PostgresConnectionParams | null;
}

export interface PostgresPrivateQueryConnectionStatus2 {
  kind: 'connectionStatus2';
  value: ConnectionEditorModel<PostgresConnectionParams>;
}

export type PostgresPrivateQuery =
  | PostgresPrivateQueryDebugExec
  | PostgresPrivateQueryConnectionStatus
  | PostgresPrivateQueryConnectionStatus2;
