import { BindableAttrValue } from '@mui/toolpad-core';
import { ServerDataSource, ApiResult } from '../../types';
import { FetchQuery, RestConnectionParams } from './types';
import * as bindings from '../../utils/bindings';
import evalExpression from '../../server/evalExpression';
import { removeLeading } from '../../utils/strings';
import { Maybe } from '../../utils/types';
import { getAuthenticationHeaders, parseBaseUrl } from './shared';

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
    return new URL(parsedBase.href + removeLeading(queryUrl, '/'));
  }

  return new URL(queryUrl);
}

async function exec(
  connection: Maybe<RestConnectionParams>,
  fetchQuery: FetchQuery,
  params: Record<string, string>,
): Promise<ApiResult<any>> {
  const boundValues = { ...fetchQuery.params, ...params };
  const resolvedUrl = await resolveBindableString(fetchQuery.url, boundValues);

  const queryUrl = parseQueryUrl(resolvedUrl, connection?.baseUrl);

  const headers = [
    ...(connection ? getAuthenticationHeaders(connection.authentication) : []),
    ...(connection?.headers || []),
  ];

  const res = await fetch(queryUrl.href, { headers });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  return { data };
}

const dataSource: ServerDataSource<{}, FetchQuery, any> = {
  exec,
};

export default dataSource;
