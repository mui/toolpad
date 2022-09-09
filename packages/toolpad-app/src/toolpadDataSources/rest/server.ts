import {
  BindableAttrEntries,
  BindableAttrValue,
  BindableAttrValues,
  ExecFetchResult,
} from '@mui/toolpad-core';
import fetch, { Headers, RequestInit, Response } from 'node-fetch';
import MIMEType from 'whatwg-mimetype';
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
import evalExpression from '../../server/evalExpression';
import { removePrefix } from '../../utils/strings';
import { Maybe } from '../../utils/types';
import { getAuthenticationHeaders, HTTP_NO_BODY, parseBaseUrl } from './shared';
import applyTransform from '../../server/applyTransform';
import { errorFrom } from '../../utils/errors';

async function resolveBindable(
  bindable: BindableAttrValue<string>,
  boundValues: Record<string, string>,
): Promise<any> {
  if (bindable.type === 'const') {
    return bindable.value;
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

async function resolveBindableEntries(
  entries: BindableAttrEntries,
  boundValues: Record<string, string>,
): Promise<[string, any][]> {
  return Promise.all(
    entries.map(async ([key, value]) => [key, await resolveBindable(value, boundValues)]),
  );
}

async function resolveBindables<P>(
  obj: BindableAttrValues<P>,
  boundValues: Record<string, string>,
): Promise<P> {
  return Object.fromEntries(
    await resolveBindableEntries(Object.entries(obj) as BindableAttrEntries, boundValues),
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
  boundValues: Record<string, string>,
): Promise<ResolvedRawBody> {
  const { content, contentType } = await resolveBindables(
    {
      contentType: body.contentType,
      content: body.content,
    },
    boundValues,
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
  boundValues: Record<string, string>,
): Promise<ResolveUrlEncodedBodyBody> {
  return {
    kind: 'urlEncoded',
    content: await resolveBindableEntries(body.content, boundValues),
  };
}

async function resolveBody(body: Body, boundValues: Record<string, string>) {
  switch (body.kind) {
    case 'raw':
      return resolveRawBody(body, boundValues);
    case 'urlEncoded':
      return resolveUrlEncodedBody(body, boundValues);
    default:
      throw new Error(`Missing case for "${(body as Body).kind}"`);
  }
}

function isJSON(mimeType: MIMEType): boolean {
  // See https://mimesniff.spec.whatwg.org/#json-mime-type
  const essence = `${mimeType.type}/${mimeType.subtype}`;
  return (
    essence === 'text/json' || essence === 'application/json' || mimeType.subtype.endsWith('+json')
  );
}

async function readData(res: Response): Promise<any> {
  const contentType = res.headers.get('content-type');
  const mimeType = contentType ? new MIMEType(contentType) : null;
  return mimeType && isJSON(mimeType) ? res.json() : res.text();
}

async function execBase(
  connection: Maybe<RestConnectionParams>,
  fetchQuery: FetchQuery,
  params: Record<string, string>,
): Promise<FetchResult> {
  const [resolvedUrl, resolvedSearchParams, resolvedHeaders] = await Promise.all([
    resolveBindable(fetchQuery.url, params),
    resolveBindableEntries(fetchQuery.searchParams || [], params),
    resolveBindableEntries(fetchQuery.headers || [], params),
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
    const resolvedBody = await resolveBody(fetchQuery.body, params);

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
      throw new Error(`HTTP ${res.status}`);
    }

    untransformedData = await readData(res);
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
