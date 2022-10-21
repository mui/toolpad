import {
  BindableAttrEntries,
  BindableAttrValue,
  BindableAttrValues,
  ExecFetchResult,
} from '@mui/toolpad-core';
import fetch, { Headers, RequestInit, Response } from 'node-fetch';
import { withHarInstrumentation, createHarLog } from '../../server/har';
import { ServerDataSource } from '../../types';
import {
  Body,
  FetchPrivateQuery,
  FetchQuery,
  FetchResult,
  RawBody,
  RestConnectionParams,
  UrlEncodedBody,
} from './types';
import evalExpression, { Serializable } from '../../server/evalExpression';
import { removePrefix } from '../../utils/strings';
import { Maybe } from '../../utils/types';
import { getAuthenticationHeaders, HTTP_NO_BODY, parseBaseUrl } from './shared';
import applyTransform from '../../server/applyTransform';
import { errorFrom } from '../../utils/errors';
import config from '../../config';
import DEMO_BASE_URLS from './demoBaseUrls';

async function resolveBindable(
  bindable: BindableAttrValue<string>,
  scope: Record<string, Serializable>,
): Promise<any> {
  if (bindable.type === 'const') {
    return bindable.value;
  }
  if (bindable.type === 'jsExpression') {
    return evalExpression(bindable.value, scope);
  }
  throw new Error(
    `Can't resolve bindable of type "${(bindable as BindableAttrValue<unknown>).type}"`,
  );
}

async function resolveBindableEntries(
  entries: BindableAttrEntries,
  scope: Record<string, Serializable>,
): Promise<[string, any][]> {
  return Promise.all(
    entries.map(async ([key, value]) => [key, await resolveBindable(value, scope)]),
  );
}

async function resolveBindables<P>(
  obj: BindableAttrValues<P>,
  scope: Record<string, Serializable>,
): Promise<P> {
  return Object.fromEntries(
    await resolveBindableEntries(Object.entries(obj) as BindableAttrEntries, scope),
  ) as P;
}

function parseQueryUrl(queryUrl: string, baseUrl: Maybe<string>): URL {
  if (baseUrl) {
    const parsedBase = parseBaseUrl(baseUrl);
    return new URL(parsedBase.href + removePrefix(queryUrl, '/'));
  }

  return new URL(queryUrl);
}

interface ResolvedRawBody {
  kind: 'raw';
  contentType: string;
  content: string;
}

async function resolveRawBody(
  body: RawBody,
  scope: Record<string, Serializable>,
): Promise<ResolvedRawBody> {
  const { content, contentType } = await resolveBindables(
    {
      contentType: body.contentType,
      content: body.content,
    },
    scope,
  );
  return {
    kind: 'raw',
    contentType,
    content: String(content),
  };
}

interface ResolveUrlEncodedBodyBody {
  kind: 'urlEncoded';
  content: [string, string][];
}

async function resolveUrlEncodedBody(
  body: UrlEncodedBody,
  scope: Record<string, Serializable>,
): Promise<ResolveUrlEncodedBodyBody> {
  return {
    kind: 'urlEncoded',
    content: await resolveBindableEntries(body.content, scope),
  };
}

async function resolveBody(body: Body, scope: Record<string, Serializable>) {
  switch (body.kind) {
    case 'raw':
      return resolveRawBody(body, scope);
    case 'urlEncoded':
      return resolveUrlEncodedBody(body, scope);
    default:
      throw new Error(`Missing case for "${(body as Body).kind}"`);
  }
}

async function readData(res: Response, fetchQuery: FetchQuery): Promise<any> {
  if (!fetchQuery.response || fetchQuery.response?.kind === 'json') {
    return res.json();
  }
  if (fetchQuery.response?.kind === 'raw') {
    return res.text();
  }
  throw new Error(`Unsupported response type "${fetchQuery.response.kind}"`);
}

async function execBase(
  connection: Maybe<RestConnectionParams>,
  fetchQuery: FetchQuery,
  params: Record<string, string>,
): Promise<FetchResult> {
  const queryScope = {
    // TODO: remove deprecated query after v1
    query: params,
    parameters: params,
  };

  const [resolvedUrl, resolvedSearchParams, resolvedHeaders] = await Promise.all([
    resolveBindable(fetchQuery.url, queryScope),
    resolveBindableEntries(fetchQuery.searchParams || [], queryScope),
    resolveBindableEntries(fetchQuery.headers || [], queryScope),
  ]);

  if (config.isDemo) {
    const demoUrls = DEMO_BASE_URLS.map((baseUrl) => baseUrl.url);

    const hasNonDemoConnectionParams =
      !demoUrls.includes(connection?.baseUrl || '') ||
      (!!connection?.headers && connection.headers.length > 0) ||
      !!connection?.authentication;
    const hasNonDemoQueryParams =
      fetchQuery.method !== 'GET' || (!!fetchQuery.headers && fetchQuery.headers.length > 0);

    if (hasNonDemoConnectionParams || hasNonDemoQueryParams) {
      throw new Error(`Cannot use these features in demo version.`);
    }
  }

  const queryUrl = parseQueryUrl(resolvedUrl, connection?.baseUrl);
  resolvedSearchParams.forEach(([key, value]) => queryUrl.searchParams.append(key, value));

  const headers = new Headers([
    ...(connection ? getAuthenticationHeaders(connection.authentication) : []),
    ...(connection?.headers || []),
  ]);
  resolvedHeaders.forEach(([key, value]) => headers.append(key, value));

  const method = fetchQuery.method || 'GET';

  const requestInit: RequestInit = { method, headers };

  if (!HTTP_NO_BODY.has(method) && fetchQuery.body) {
    const resolvedBody = await resolveBody(fetchQuery.body, queryScope);

    switch (resolvedBody.kind) {
      case 'raw': {
        headers.set('content-type', resolvedBody.contentType);
        requestInit.body = resolvedBody.content;
        break;
      }
      case 'urlEncoded': {
        headers.set('content-type', 'application/x-www-form-urlencoded');
        requestInit.body = new URLSearchParams(resolvedBody.content).toString();
        break;
      }
      default:
        throw new Error(`Missing case for "${(resolvedBody as any).kind}"`);
    }
  }

  let error: Error | undefined;
  let untransformedData;
  let data;
  const har = createHarLog();

  try {
    const instrumentedFetch = withHarInstrumentation(fetch, { har });
    const res = await instrumentedFetch(queryUrl.href, requestInit);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} (${res.statusText}) while fetching "${res.url}"`);
    }

    untransformedData = await readData(res, fetchQuery);
    data = untransformedData;

    if (fetchQuery.transformEnabled && fetchQuery.transform) {
      data = await applyTransform(fetchQuery.transform, untransformedData);
    }
  } catch (rawError) {
    error = errorFrom(rawError);
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
): Promise<ExecFetchResult<any>> {
  const { data, error } = await execBase(connection, fetchQuery, params);
  return { data, error };
}

const dataSource: ServerDataSource<{}, FetchQuery, any> = {
  exec,
  execPrivate,
};

export default dataSource;
