import {
  BindableAttrEntries,
  BindableAttrValue,
  BindableAttrValues,
  Serializable,
} from '@mui/toolpad-core';
import { ensureSuffix, removePrefix } from '../../utils/strings';
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
import applyTransform from '../../server/applyTransform';
import { errorFrom } from '../../utils/errors';
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

interface EvalExpression {
  (expression: string, scope: Record<string, Serializable>): Promise<any>;
}

async function resolveBindable(
  bindable: BindableAttrValue<string>,
  evalExpression: EvalExpression,
  scope: Record<string, Serializable>,
): Promise<any> {
  if (bindable.type === 'const') {
    return bindable.value;
  }
  if (bindable.type === 'jsExpression') {
    const result = await evalExpression(bindable.value, scope);
    return result;
  }
  throw new Error(
    `Can't resolve bindable of type "${(bindable as BindableAttrValue<unknown>).type}"`,
  );
}

async function resolveBindableEntries(
  entries: BindableAttrEntries,
  evalExpression: EvalExpression,
  scope: Record<string, Serializable>,
): Promise<[string, any][]> {
  return Promise.all(
    entries.map(async ([key, value]) => [key, await resolveBindable(value, evalExpression, scope)]),
  );
}

async function resolveBindables<P>(
  obj: BindableAttrValues<P>,
  evalExpression: EvalExpression,
  scope: Record<string, Serializable>,
): Promise<P> {
  return Object.fromEntries(
    await resolveBindableEntries(Object.entries(obj) as BindableAttrEntries, evalExpression, scope),
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
  evalExpression: EvalExpression,
  scope: Record<string, Serializable>,
): Promise<ResolvedRawBody> {
  const { content, contentType } = await resolveBindables(
    {
      contentType: body.contentType,
      content: body.content,
    },
    evalExpression,
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
  evalExpression: EvalExpression,
  scope: Record<string, Serializable>,
): Promise<ResolveUrlEncodedBodyBody> {
  return {
    kind: 'urlEncoded',
    content: await resolveBindableEntries(body.content, evalExpression, scope),
  };
}

async function resolveBody(
  body: Body,
  evalExpression: EvalExpression,
  scope: Record<string, Serializable>,
) {
  switch (body.kind) {
    case 'raw':
      return resolveRawBody(body, evalExpression, scope);
    case 'urlEncoded':
      return resolveUrlEncodedBody(body, evalExpression, scope);
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
  evalExpression: EvalExpression;
  fetchImpl: typeof fetch;
}

export async function execfetch(
  fetchQuery: FetchQuery,
  params: Record<string, string>,
  { connection, evalExpression, fetchImpl }: ExecBaseOptions,
): Promise<FetchResult> {
  const queryScope = {
    // TODO: remove deprecated query after v1
    query: params,
    parameters: params,
  };

  const urlvalue = fetchQuery.url || getDefaultUrl(connection);

  const [resolvedUrl, resolvedSearchParams, resolvedHeaders] = await Promise.all([
    resolveBindable(urlvalue, evalExpression, queryScope),
    resolveBindableEntries(fetchQuery.searchParams || [], evalExpression, queryScope),
    resolveBindableEntries(fetchQuery.headers || [], evalExpression, queryScope),
  ]);

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
    const resolvedBody = await resolveBody(fetchQuery.body, evalExpression, queryScope);

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

  try {
    const res = await fetchImpl(queryUrl.href, requestInit);

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

  return { data, untransformedData, error };
}
