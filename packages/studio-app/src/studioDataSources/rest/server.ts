import {
  StudioBindable,
  ConnectionStatus,
  StudioDataSourceServer,
  StudioApiResult,
} from '../../types';
import { FetchQuery, RestConnectionParams } from './types';
import * as bindings from '../../utils/bindings';

function resolveBindableString(
  bindable: StudioBindable<string>,
  boundValues: Record<string, string>,
): string {
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
  throw new Error(`Can't resolve bindable of type "${(bindable as StudioBindable<unknown>).type}"`);
}

async function test(): Promise<ConnectionStatus> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { timestamp: Date.now() };
}

async function exec(
  connection: RestConnectionParams,
  fetchQuery: FetchQuery,
  params: Record<string, string>,
): Promise<StudioApiResult<any>> {
  const boundValues = { ...fetchQuery.params, ...params };
  const resolvedUrl = resolveBindableString(fetchQuery.url, boundValues);
  const res = await fetch(resolvedUrl);
  const data = await res.json();
  return { data };
}

const dataSource: StudioDataSourceServer<{}, FetchQuery, any> = {
  test,
  exec,
  createHandler: null,
};

export default dataSource;
