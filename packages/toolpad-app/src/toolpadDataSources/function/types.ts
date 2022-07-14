export interface FunctionConnectionParams {
  secrets?: [string, string][];
}

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

export interface LogRequest {
  method: string;
  url: string;
  headers: [string, string][];
}

export interface LogResponse {
  status: number;
  statusText: string;
  ok: boolean;
  headers: [string, string][];
  bodyUsed: boolean;
  redirected: boolean;
  type: Response['type'];
  url: string;
}

export interface LogConsoleEntry {
  timestamp: number;
  level: string;
  kind: 'console';
  args: any[];
}

export interface LogRequestEntry {
  timestamp: number;
  kind: 'request';
  id: string;
  request: LogRequest;
}

export interface LogResponseEntry {
  timestamp: number;
  kind: 'response';
  id: string;
  response: LogResponse;
}

export type LogEntry = LogConsoleEntry | LogRequestEntry | LogResponseEntry;

export interface FunctionResult {
  data: any;
  error?: Error;
  logs: LogEntry[];
}

export type FunctionPrivateQuery =
  | { kind: 'debugExec'; query: FunctionQuery; params: Record<string, any> }
  | { kind: 'secretsKeys' };
