import { getQuickJS } from 'quickjs-emscripten';
import ivm from 'isolated-vm';
import { ServerDataSource, ApiResult } from '../../types';
import { FunctionQuery, FunctionConnectionParams } from './types';
import { Maybe } from '../../utils/types';
import { newJson } from '../../server/evalExpression';

async function execQuickjs(
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

const isolate = new ivm.Isolate({ memoryLimit: 128 });

export async function execIsolatedVm(
  connection: Maybe<FunctionConnectionParams>,
  functionQuery: FunctionQuery,
  params: Record<string, string>,
): Promise<ApiResult<any>> {
  const context = isolate.createContextSync();
  const jail = context.global;
  jail.setSync('global', jail.derefInto());

  await context.evalClosure(
    `
      const INTERNALS = Symbol('Fetch internals');

      global.Response = class Response {
        constructor() {}
        get ok () {
          return this[INTERNALS].getSync(ok);
        }
        get status () {
          return this[INTERNALS].getSync(status);
        }
        json () {
          return this[INTERNALS].getSync('json').apply(null, args, { result: { copy: true, promise: true }});
        }
        text () {
          return this[INTERNALS].getSync('text').apply(null, args, { result: { copy: true, promise: true }});
        }
      }

      global.fetch = async (...args) => {
        const responseRef = await $0.apply(null, args, { result: { promise: true }});
        const response = new Response();
        respons[INTERNALS] = responseRef;
        return response;
      }
    `,
    [
      (...args) => {
        return fetch(...args).then((res) => ({
          ok: res.ok,
          status: res.status,
          json: new ivm.Reference(() => res.json()),
          text: new ivm.Reference(() => res.text()),
        }));
      },
    ],
    { arguments: { reference: true } },
  );

  const userModule = await isolate.compileModule(functionQuery.module);

  await userModule.instantiate(context, (specifier) => {
    throw new Error(`Not found "${specifier}"`);
  });

  userModule.evaluateSync();

  const defaultExport = await userModule.namespace.get('default', { reference: true });

  const result = await defaultExport.apply(null, [2, 4], { result: { copy: true, promise: true } });

  return result;
}

const dataSource: ServerDataSource<{}, FunctionQuery, any> = {
  exec: execIsolatedVm,
};

export default dataSource;
