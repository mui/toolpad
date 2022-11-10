import { transform } from 'sucrase';
import { ExecFetchFn, RuntimeDataSource } from '../../types';
import { FunctionQuery, FunctionResult } from './types';
import { createHarLog } from '../../utils/har';

export interface ExecFunctionOptions {
  params?: Record<string, unknown>;
  secrets?: Record<string, string>;
}

async function execFunction(code: string, { params = {}, secrets = {} }: ExecFunctionOptions = {}) {
  const compiled = transform(code, { transforms: ['typescript'] });
  const dataUri = `data:text/javascript;base64,${btoa(compiled.code)}`;
  const { default: fn } = await import(/* webpackIgnore: true */ dataUri);
  const result = await fn({
    params,
    parameters: params,
    secrets,
  });
  return result;
}

export async function clientExec(
  fetchQuery: FunctionQuery,
  params: Record<string, string>,
  serverFetch: ExecFetchFn<FunctionQuery, FunctionResult>,
): Promise<FunctionResult> {
  if (fetchQuery.browser) {
    const data = await execFunction(fetchQuery.module, { params, secrets: {} });
    return { data, logs: [], har: createHarLog() };
  }

  return serverFetch(fetchQuery, params);
}

const dataSource: RuntimeDataSource<FunctionQuery, FunctionResult> = {
  exec: clientExec,
};

export default dataSource;
