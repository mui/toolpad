import { ExecFetchResult } from '@mui/toolpad-core';
import fetch from 'node-fetch';
import { createServerJsRuntime } from '@mui/toolpad-core/jsRuntime';
import { withHarInstrumentation, createHarLog } from '../../server/har';
import { ServerDataSource } from '../../types';
import { FetchPrivateQuery, FetchQuery, RestConnectionParams } from './types';
import { Maybe } from '../../utils/types';
import config from '../../server/config';
import { execfetch } from './shared';

async function execBase(
  connection: Maybe<RestConnectionParams>,
  fetchQuery: FetchQuery,
  params: Record<string, string>,
) {
  if (config.isDemo) {
    throw new Error('Cannot use these features in demo version.');
  }

  const har = createHarLog();
  const instrumentedFetch = withHarInstrumentation(fetch, { har });

  const jsServerRuntime = await createServerJsRuntime();
  const result = await execfetch(fetchQuery, params, {
    connection,
    jsRuntime: jsServerRuntime,
    fetchImpl: instrumentedFetch as any,
  });

  return { ...result, har };
}

async function execPrivate(connection: Maybe<RestConnectionParams>, query: FetchPrivateQuery) {
  switch (query.kind) {
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
