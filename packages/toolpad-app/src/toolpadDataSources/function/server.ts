import { getQuickJS } from 'quickjs-emscripten';
import { ServerDataSource, ApiResult } from '../../types';
import { FunctionQuery, FunctionConnectionParams } from './types';
import { Maybe } from '../../utils/types';
import { newJson } from '../../server/evalExpression';

async function exec(
  connection: Maybe<FunctionConnectionParams>,
  functionQuery: FunctionQuery,
  params: Record<string, string>,
): Promise<ApiResult<any>> {
  const QuickJS = await getQuickJS();

  const runtime = QuickJS.newRuntime();

  runtime.setModuleLoader((moduleName) => {
    if (moduleName === 'toolpad:serverless-module') {
      return functionQuery.module;
    }
    throw new Error(`Unrecognized module "${moduleName}"`);
  });
  const context = runtime.newContext();

  const fetchHandle = context.newFunction('fetch', (urlHandle) => {
    const url = context.getString(urlHandle);
    urlHandle.dispose();

    const promise = context.newPromise();

    fetch(url).then(
      async (res) => {
        const resHandle = context.newObject();

        const jsonFnHandle = context.newFunction('json', () => {
          const promise = context.newPromise();
          res.json().then(
            (jsonValue) => {
              const jsonHandle = newJson(context, jsonValue);
              promise.resolve(jsonHandle);
              jsonHandle.dispose();
            },
            (err) => promise.reject(context.newError(err.message)),
          );
          promise.settled.then(context.runtime.executePendingJobs);
          return promise.handle;
        });
        context.setProp(resHandle, 'json', jsonFnHandle);
        jsonFnHandle.dispose();

        promise.resolve(resHandle);
        resHandle.dispose();
      },
      (err) => {
        const errHandle = context.newError(err?.message || 'Unknown error');
        promise.reject(errHandle);
        errHandle.dispose();
      },
    );

    promise.settled.then(context.runtime.executePendingJobs);
    return promise.handle;
  });
  fetchHandle.consume((handle) => context.setProp(context.global, 'fetch', handle));

  const ok = context.evalCode(`
import fn from 'toolpad:serverless-module';
globalThis.result = (async () => fn())();
  `);
  context.unwrapResult(ok).dispose();

  const promiseHandle = context.getProp(context.global, 'result');

  setTimeout(() => {
    runtime.executePendingJobs();
  }, 1000);

  const resolvedResult = await context.resolvePromise(promiseHandle);
  promiseHandle.dispose();

  const resolvedHandle = context.unwrapResult(resolvedResult);
  const apiResult = context.dump(resolvedHandle);
  resolvedHandle.dispose();

  context.dispose();
  runtime.dispose();

  return apiResult;
}

const dataSource: ServerDataSource<{}, FunctionQuery, any> = {
  exec,
};

export default dataSource;
