import {
  BindableAttrEntries,
  BindableAttrValue,
  BindableAttrValues,
  JsRuntime,
} from '@mui/toolpad-core';
import { SerializedError, errorFrom, serializeError } from '@mui/toolpad-utils/errors';
import { evaluateBindable } from '@mui/toolpad-core/jsRuntime';
import { ensureSuffix, removePrefix } from '@mui/toolpad-utils/strings';
import { Maybe } from '../../utils/types';
import {
  Authentication,
  Body,
  FetchQuery,
  FetchResult,
  RawBody,
  RestConnectionParams,
  UrlEncodedBody,
} from './types';
import applyTransform from '../applyTransform';
import { MOVIES_API_DEMO_URL } from '../demo';

export const HTTP_NO_BODY = new Set(['GET', 'HEAD']);

export function getAuthenticationHeaders(auth: Maybe<Authentication>): [string, string][] {
  if (!auth) {
    return [];
  }

  switch (auth.type) {
    case 'basic':
      return [
        [
          'Authorization',
          `Basic ${Buffer.from(`${auth.user}:${auth.password}`, 'utf-8').toString('base64')}`,
        ],
      ];
    case 'bearerToken':
      return [['Authorization', `Bearer ${auth.token}`]];
    case 'apiKey':
      return [[auth.header, auth.key]];
    default:
      throw new Error(`Unsupported authentication type "${(auth as Authentication).type}"`);
  }
}

export function parseBaseUrl(baseUrl: string): URL {
  const parsedBase = new URL(baseUrl);
  parsedBase.pathname = ensureSuffix(parsedBase.pathname, '/');
  parsedBase.search = '';
  parsedBase.hash = '';
  return parsedBase;
}

function resolveBindable(
  jsRuntime: JsRuntime,
  bindable: BindableAttrValue<string>,
  scope: Record<string, unknown>,
  env?: Record<string, string>,
): any {
  const { value, error } = evaluateBindable(jsRuntime, bindable, scope, env);
  if (error) {
    throw error;
  }
  return value;
}

function resolveBindableEntries(
  jsRuntime: JsRuntime,
  entries: BindableAttrEntries,
  scope: Record<string, unknown>,
  env?: Record<string, string>,
): [string, any][] {
  return entries.map(([key, value]) => [key, resolveBindable(jsRuntime, value, scope, env)]);
}

function resolveBindables<P>(
  jsRuntime: JsRuntime,
  obj: BindableAttrValues<P>,
  scope: Record<string, unknown>,
  env?: Record<string, string>,
): P {
  return Object.fromEntries(
    resolveBindableEntries(jsRuntime, Object.entries(obj) as BindableAttrEntries, scope, env),
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

function resolveRawBody(
  jsRuntime: JsRuntime,
  body: RawBody,
  scope: Record<string, unknown>,
): ResolvedRawBody {
  const { content, contentType } = resolveBindables(
    jsRuntime,
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

function resolveUrlEncodedBody(
  jsRuntime: JsRuntime,
  body: UrlEncodedBody,
  scope: Record<string, unknown>,
  env?: Record<string, string>,
): ResolveUrlEncodedBodyBody {
  return {
    kind: 'urlEncoded',
    content: resolveBindableEntries(jsRuntime, body.content, scope, env),
  };
}

function resolveBody(jsRuntime: JsRuntime, body: Body, scope: Record<string, unknown>) {
  switch (body.kind) {
    case 'raw':
      return resolveRawBody(jsRuntime, body, scope);
    case 'urlEncoded':
      return resolveUrlEncodedBody(jsRuntime, body, scope);
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

export function getDefaultUrl(connection?: RestConnectionParams | null): BindableAttrValue<string> {
  const baseUrl = connection?.baseUrl;

  return {
    type: 'const',
    value: baseUrl ? '' : MOVIES_API_DEMO_URL,
  };
}

interface ExecBaseOptions {
  connection?: Maybe<RestConnectionParams>;
  jsRuntime: JsRuntime;
  fetchImpl: typeof fetch;
}

export async function execfetch(
  fetchQuery: FetchQuery,
  params: Record<string, string>,
  { connection, jsRuntime, fetchImpl }: ExecBaseOptions,
  env: Record<string, string> = {},
): Promise<FetchResult> {
  const queryScope = {
    // @TODO: remove deprecated query after v1
    query: params,
    parameters: params,
  };

  const urlvalue = fetchQuery.url || getDefaultUrl(connection);

  const resolvedUrl = resolveBindable(jsRuntime, urlvalue, queryScope, env);
  const resolvedSearchParams = resolveBindableEntries(
    jsRuntime,
    fetchQuery.searchParams || [],
    queryScope,
    env,
  );
  const resolvedHeaders = resolveBindableEntries(
    jsRuntime,
    fetchQuery.headers || [],
    queryScope,
    env,
  );

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
    const resolvedBody = resolveBody(jsRuntime, fetchQuery.body, queryScope);

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

  let error: SerializedError | undefined;
  let untransformedData;
  let data;

  try {
    const res = await fetchImpl(queryUrl.href, requestInit);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} (${res.statusText}) while fetching "${res.url}"`);
    }

    untransformedData = await readData(res, fetchQuery);
    data = untransformedData;

    if (fetchQuery.transformEnabled && fetchQuery.transform) {
      data = await applyTransform(jsRuntime, fetchQuery.transform, untransformedData);
    }
  } catch (rawError) {
    error = serializeError(errorFrom(rawError));
  }

  return { data, untransformedData, error };
}
