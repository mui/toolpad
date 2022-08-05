import { BindableAttrValue } from '@mui/toolpad-core';
import fetch from 'node-fetch';
import { withHarInstrumentation, createHarLog } from '../../utils/har';
import { ServerDataSource, ApiResult } from '../../types';
import { FetchPrivateQuery, FetchQuery, FetchResult, RestConnectionParams } from './types';
import * as bindings from '../../utils/bindings';
import evalExpression from '../../server/evalExpression';
import { removePrefix } from '../../utils/strings';
import { Maybe } from '../../utils/types';
import { getAuthenticationHeaders, parseBaseUrl } from './shared';
import applyTransform from '../../server/applyTransform';

async function resolveBindableString(
  bindable: BindableAttrValue<string>,
  boundValues: Record<string, string>,
): Promise<string> {
  if (bindable.type === 'const') {
    return bindable.value;
  }
  if (bindable.type === 'binding') {
    return boundValues[bindable.value] || '';
  }
  if (bindable.type === 'boundExpression') {
    const parsed = bindings.parse(bindable.value);
    const resolved = bindings.resolve(parsed, (interpolation) => boundValues[interpolation] || '');
    return bindings.formatStringValue(resolved);
  }
  if (bindable.type === 'jsExpression') {
    return evalExpression(bindable.value, {
      query: boundValues,
    });
  }
  throw new Error(
    `Can't resolve bindable of type "${(bindable as BindableAttrValue<unknown>).type}"`,
  );
}

function parseQueryUrl(queryUrl: string, baseUrl: Maybe<string>): URL {
  if (baseUrl) {
    const parsedBase = parseBaseUrl(baseUrl);
    return new URL(parsedBase.href + removePrefix(queryUrl, '/'));
  }

  return new URL(queryUrl);
}

async function execBase(
  connection: Maybe<RestConnectionParams>,
  fetchQuery: FetchQuery,
  params: Record<string, string>,
): Promise<FetchResult> {
  const resolvedUrl = await resolveBindableString(fetchQuery.url, params);

  const queryUrl = parseQueryUrl(resolvedUrl, connection?.baseUrl);

  const headers = [
    ...(connection ? getAuthenticationHeaders(connection.authentication) : []),
    ...(connection?.headers || []),
  ];

  const method = fetchQuery.method;

  let error: Error | undefined;
  let untransformedData;
  let data;
  const har = createHarLog();

  try {
    const instrumentedFetch = withHarInstrumentation(fetch, { har });
    const res = await instrumentedFetch(queryUrl.href, { method, headers });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    untransformedData = await res.json();
    data = untransformedData;

    if (fetchQuery.transformEnabled && fetchQuery.transform) {
      data = await applyTransform(fetchQuery.transform, untransformedData);
    }
  } catch (err: any) {
    error = err;
  }

  return { data, untransformedData, error, har };
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
): Promise<ApiResult<any>> {
  const { data, error } = await execBase(connection, fetchQuery, params);

  if (error) {
    throw error;
  }

  return { data };
}

const dataSource: ServerDataSource<{}, FetchQuery, any> = {
  exec,
  execPrivate,
};

export default dataSource;
