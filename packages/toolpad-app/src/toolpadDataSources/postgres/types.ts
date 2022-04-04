export interface PostgresConnectionParams {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface PostgresQuery {
  text: string;
  params: any[];
}
