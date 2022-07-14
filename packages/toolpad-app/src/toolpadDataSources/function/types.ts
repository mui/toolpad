import { LogEntry } from '../../components/Console';

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

export interface FunctionResult {
  data: any;
  error?: Error;
  logs: LogEntry[];
}

export type FunctionPrivateQuery =
  | { kind: 'debugExec'; query: FunctionQuery; params: Record<string, any> }
  | { kind: 'secretsKeys' };
