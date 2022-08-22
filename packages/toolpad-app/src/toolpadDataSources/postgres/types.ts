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

export interface PostgresResult {
  data: any;
  error?: Error;
}

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
  params: PostgresConnectionParams;
}

export type PostgresPrivateQuery =
  | PostgresPrivateQueryDebugExec
  | PostgresPrivateQueryConnectionStatus;
