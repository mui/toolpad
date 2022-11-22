import { ExecFetchResult } from '@mui/toolpad-core';
import { Har } from 'har-format';
import { LogEntry } from '../../components/Console';

export interface FunctionConnectionParams {
  secrets?: [string, string][];
}

export interface FunctionQuery {
  /**
   * Run in the browser.
   */
  readonly browser?: boolean;
  readonly module: string;
}

export interface PrivateQuery<I, R> {
  input: I;
  result: R;
}

export interface PrivateQueries {
  debug: PrivateQuery<FunctionQuery, {}>;
}

export interface FunctionResult extends ExecFetchResult<any> {
  logs: LogEntry[];
  har: Har;
}

export type FunctionPrivateQuery =
  | { kind: 'debugExec'; query: FunctionQuery; params: Record<string, any> }
  | { kind: 'secretsKeys' };

export interface ExecFunctionOptions {
  params?: Record<string, unknown>;
  secrets?: Record<string, string>;
}
