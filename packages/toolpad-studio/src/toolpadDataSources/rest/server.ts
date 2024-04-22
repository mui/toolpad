import {
  ExecFetchResult,
  BindableAttrEntries,
  BindableAttrValue,
  BindableAttrValues,
  JsRuntime,
} from '@toolpad/studio-runtime';
import fetch, { RequestInit, Response, Headers } from 'node-fetch';
import { createServerJsRuntime } from '@toolpad/studio-runtime/jsServerRuntime';
import { SerializedError, errorFrom, serializeError } from '@toolpad/utils/errors';
import { evaluateBindable } from '@toolpad/studio-runtime/jsRuntime';
import { removePrefix } from '@toolpad/utils/strings';
import { Maybe } from '@toolpad/utils/types';
import { withHarInstrumentation, createHarLog } from '../../server/har';
import { ServerDataSource } from '../../types';
import {
  FetchPrivateQuery,
  Body,
  FetchQuery,
  FetchResult,
  RawBody,
  RestConnectionParams,
  UrlEncodedBody,
  IntrospectionResult,
} from './types';
import applyTransform from '../applyTransform';
import { HTTP_NO_BODY, getAuthenticationHeaders, parseBaseUrl } from './shared';
import type { IToolpadProject } from '../server';

function resolveBindable<T>(
  jsRuntime: JsRuntime,
  bindable: BindableAttrValue<T>,
  scope: Record<string, unknown>,
): T {
  const { value, error } = evaluateBindable(jsRuntime, bindable, scope);
  if (error) {
    throw error;
  }
  return value as T;
}

function resolveBindableEntries(
  jsRuntime: JsRuntime,
  entries: BindableAttrEntries,
  scope: Record<string, unknown>,
): [string, any][] {
  return entries.map(([key, value]) => [key, resolveBindable(jsRuntime, value, scope)]);
}

function resolveBindables<P>(
  jsRuntime: JsRuntime,
  obj: BindableAttrValues<P>,
  scope: Record<string, unknown>,
): P {
  return Object.fromEntries(
    resolveBindableEntries(jsRuntime, Object.entries(obj) as BindableAttrEntries, scope),
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
): ResolveUrlEncodedBodyBody {
  return {
    kind: 'urlEncoded',
    content: resolveBindableEntries(jsRuntime, body.content, scope),
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

async function execBase(
  project: IToolpadProject,
  connection: Maybe<RestConnectionParams>,
  fetchQuery: FetchQuery,
  params: Record<string, string | BindableAttrValue<any>>,
): Promise<FetchResult> {
  const har = createHarLog();
  const instrumentedFetch = withHarInstrumentation(fetch, { har });
  const jsRuntime = createServerJsRuntime(process.env);
  const resolvedParams = resolveBindableEntries(jsRuntime, Object.entries(params), {});

  const queryScope = {
    // @TODO: remove deprecated query after v1
    query: params,
    parameters: Object.fromEntries(resolvedParams),
  };

  const urlvalue = fetchQuery.url ?? '';
  const resolvedUrl = resolveBindable(jsRuntime, urlvalue, queryScope);
  const resolvedSearchParams = resolveBindableEntries(
    jsRuntime,
    fetchQuery.searchParams || [],
    queryScope,
  );
  const resolvedHeaders = resolveBindableEntries(jsRuntime, fetchQuery.headers || [], queryScope);

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
    const res = await instrumentedFetch(queryUrl.href, requestInit);

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
  return { data, untransformedData, error, har };
}

export default function createDatasource(
  project: IToolpadProject,
): ServerDataSource<{}, FetchQuery, any> {
  return {
    async exec(
      connection: Maybe<RestConnectionParams>,
      fetchQuery: FetchQuery,
      params: Record<string, string>,
    ): Promise<ExecFetchResult<any>> {
      const { data, error } = await execBase(project, connection, fetchQuery, params);
      return { data, error };
    },

    async execPrivate(connection: Maybe<RestConnectionParams>, query: FetchPrivateQuery) {
      switch (query.kind) {
        case 'introspection': {
          return {
            env: process.env,
            declaredEnvKeys: await project.envManager.getDeclaredKeys(),
          } satisfies IntrospectionResult;
        }
        case 'debugExec':
          return execBase(project, connection, query.query, query.params);
        default:
          throw new Error(`Unknown private query "${(query as FetchPrivateQuery).kind}"`);
      }
    },

    api: {},
  };
}
