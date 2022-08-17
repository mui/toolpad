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

export type PostgresPrivateQuery = {
  kind: 'debugExec';
  query: PostgresQuery;
  params: Record<string, any>;
};
