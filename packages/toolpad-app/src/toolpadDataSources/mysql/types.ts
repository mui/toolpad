import { ExecFetchResult } from '@mui/toolpad-core';

export interface MySQLConnectionParams {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface MySQLQuery {
  sql: string;
}

export interface MySQLQueryConfig {
  mysqlQuery: string;
  substitutions: any[];
}

export interface MySQLResult extends ExecFetchResult<any> {}

export interface MySQLConnectionStatus {
  error: string | null;
}

export interface MySQLPrivateQueryDebugExec {
  kind: 'debugExec';
  query: MySQLQuery;
  params: Record<string, any>;
}

export interface MySQLPrivateQueryConnectionStatus {
  kind: 'connectionStatus';
  params: MySQLConnectionParams;
}

export type MySQLPrivateQuery = MySQLPrivateQueryDebugExec | MySQLPrivateQueryConnectionStatus;
