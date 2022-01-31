export interface GoogleSheetsConnectionParams {
  clientId?: string;
}

export interface PostgresQuery {
  text: string;
  params: any[];
}
