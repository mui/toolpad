import { ExecFetchResult } from '@mui/toolpad-core';

export interface MySQLQuery {
  sql: string;
  substitutions: any[];
}

export interface MySQLResult extends ExecFetchResult<any[]> {}
