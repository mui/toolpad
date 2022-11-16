import { ExecFetchResult } from '@mui/toolpad-core';
import fetch from 'node-fetch';
import { withHarInstrumentation, createHarLog } from '../../server/har';
import { ServerDataSource } from '../../types';
import { FetchPrivateQuery, FetchQuery, RestConnectionParams } from './types';
import serverEvalExpression from '../../server/evalExpression';
import { Maybe } from '../../utils/types';
import { execfetch } from './shared';
import { withOutboundRateLimiting } from '../../utils/outboundAgent';

async function execBase(
  connection: Maybe<RestConnectionParams>,
  fetchQuery: FetchQuery,
  params: Record<string, string>,
) {
  const har = createHarLog();
  const instrumentedFetch = withOutboundRateLimiting(
    // TODO: plumb appId here so we can rate limit specifically to it
    '<global>',
    withHarInstrumentation(fetch, { har }),
  );

  const result = await execfetch(fetchQuery, params, {
    connection,
    evalExpression: serverEvalExpression,
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
