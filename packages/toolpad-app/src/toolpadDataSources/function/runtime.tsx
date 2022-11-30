import { ExecFetchFn, RuntimeDataSource } from '../../types';
import { FunctionQuery, FunctionResult } from './types';
import { createHarLog } from '../../utils/har';
import loadModule from '../../runtime/loadModule';
import compileModule from '../../compileModule';

export interface ExecFunctionOptions {
  params?: Record<string, unknown>;
  secrets?: Record<string, string>;
}

async function execFunction(code: string, { params = {}, secrets = {} }: ExecFunctionOptions = {}) {
  const compiledModule = compileModule(code, 'function');
  const { default: fn } = await loadModule(compiledModule);
  const result = await fn({
    params,
    parameters: params,
    secrets,
  });
  return result;
}

export async function clientExec(
  query: FunctionQuery,
  params: Record<string, string>,
  serverFetch: ExecFetchFn<FunctionQuery, FunctionResult>,
): Promise<FunctionResult> {
  if (query.browser) {
    const data = await execFunction(query.module, { params, secrets: {} });
    return { data, logs: [], har: createHarLog() };
  }

  return serverFetch(query, params);
}

const dataSource: RuntimeDataSource<FunctionQuery, FunctionResult> = {
  exec: clientExec,
};

export default dataSource;
