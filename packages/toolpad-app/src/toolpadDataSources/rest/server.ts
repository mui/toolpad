import { ExecFetchResult } from '@mui/toolpad-core';
import fetch from 'node-fetch';
import { createServerJsRuntime } from '@mui/toolpad-core/jsServerRuntime';
import { withHarInstrumentation, createHarLog } from '../../server/har';
import { ServerDataSource } from '../../types';
import { FetchPrivateQuery, FetchQuery, RestConnectionParams } from './types';
import { Maybe } from '../../utils/types';
import { execfetch } from './shared';
import { loadEnvFile } from '../local/server';

async function execBase(
  connection: Maybe<RestConnectionParams>,
  fetchQuery: FetchQuery,
  params: Record<string, string>,
) {
  const har = createHarLog();
  const instrumentedFetch = withHarInstrumentation(fetch, { har });

  const jsServerRuntime = await createServerJsRuntime();

  const env = await loadEnvFile();

  const result = await execfetch(
    fetchQuery,
    params,
    {
      connection,
      jsRuntime: jsServerRuntime,
      fetchImpl: instrumentedFetch as any,
    },
    env,
  );

  return { ...result, har };
}

async function execPrivate(connection: Maybe<RestConnectionParams>, query: FetchPrivateQuery) {
  switch (query.kind) {
    case 'introspection': {
      const env = await loadEnvFile();
      const envVarNames = Object.keys(env);

      return { envVarNames };
    }
    case 'debugExec':
      return execBase(connection, query.query, query.params);
    default:
      throw new Error(`Unknown private query "${(query as FetchPrivateQuery).kind}"`);
  }
}

async function exec(
  connection: Maybe<RestConnectionParams>,
  fetchQuery: FetchQuery,
  params: Record<string, string>,
): Promise<ExecFetchResult<any>> {
  const { data, error } = await execBase(connection, fetchQuery, params);
  return { data, error };
}

const dataSource: ServerDataSource<{}, FetchQuery, any> = {
  exec,
  execPrivate,
};

export default dataSource;
