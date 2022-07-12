export interface FunctionConnectionParams {}

export interface FunctionQuery {
  readonly module: string;
}

export interface PrivateQuery<I, R> {
  input: I;
  result: R;
}

export interface PrivateQueries {
  debug: PrivateQuery<FunctionQuery, {}>;
}

export interface LogEntry {
  timestamp: number;
  level: string;
  kind: 'console' | 'fetch';
  args: any[];
}

export interface FunctionResult {
  data: any;
  error?: Error;
  logs: LogEntry[];
}
