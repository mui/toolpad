import { BindableAttrValue, ConnectionStatus, ServerDataSource, ApiResult } from '../../types';
import { FetchQuery, RestConnectionParams } from './types';
import * as bindings from '../../utils/bindings';
import evalExpression from '../../server/evalExpression';

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

async function test(): Promise<ConnectionStatus> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { timestamp: Date.now() };
}

async function exec(
  connection: RestConnectionParams,
  fetchQuery: FetchQuery,
  params: Record<string, string>,
): Promise<ApiResult<any>> {
  const boundValues = { ...fetchQuery.params, ...params };
  const resolvedUrl = await resolveBindableString(fetchQuery.url, boundValues);
  const res = await fetch(resolvedUrl);
  const data = await res.json();
  return { data };
}

const dataSource: ServerDataSource<{}, FetchQuery, any> = {
  test,
  exec,
};

export default dataSource;
