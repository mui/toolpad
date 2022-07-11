import ivm from 'isolated-vm';
import { ServerDataSource, ApiResult } from '../../types';
import { FunctionQuery, FunctionConnectionParams } from './types';
import { Maybe } from '../../utils/types';

const isolate = new ivm.Isolate({ memoryLimit: 128 });

export async function execIsolatedVm(
  connection: Maybe<FunctionConnectionParams>,
  functionQuery: FunctionQuery,
  params: Record<string, string>,
): Promise<ApiResult<any>> {
  const context = isolate.createContextSync();
  const jail = context.global;
  jail.setSync('global', jail.derefInto());

  const logs: { level: string; args: any[] }[] = [];

  await context.evalClosure(
    `
      global.console = {
        log: (...args) => {
          $0.apply(null, ['log', JSON.stringify(args)], { arguments: { copy: true }});
        }
      }
    `,
    [
      (level: string, serializedArgs: string) => {
        logs.push({
          level,
          args: JSON.parse(serializedArgs),
        });
      },
    ],
    { arguments: { reference: true } },
  );

  await context.evalClosure(
    `
      const INTERNALS = Symbol('Fetch internals');

      global.Response = class Response {
        constructor() {}
        get ok () {
          return this[INTERNALS].getSync('ok');
        }
        get status () {
          return this[INTERNALS].getSync('status');
        }
        get statusText () {
          return this[INTERNALS].getSync('statusText');
        }
        json (...args) {
          return this[INTERNALS].getSync('json').apply(null, args, { 
            arguments: { copy: true },
            result: { copy: true, promise: true }
          });
        }
        text (...args) {
          return this[INTERNALS].getSync('text').apply(null, args, { 
            arguments: { copy: true },
            result: { copy: true, promise: true }
          });
        }
      }

      global.fetch = async (...args) => {
        const response = new Response();
        response[INTERNALS] = await $0.apply(null, args, { result: { promise: true }});
        return response;
      }
    `,
    [
      new ivm.Reference((...args: Parameters<typeof fetch>) => {
        return fetch(...args).then((res) => ({
          ok: res.ok,
          status: res.status,
          statusText: res.statusText,
          json: new ivm.Reference(() => res.json()),
          text: new ivm.Reference(() => res.text()),
        }));
      }),
    ],
    {},
  );

  const userModule = await isolate.compileModule(functionQuery.module);

  await userModule.instantiate(context, (specifier) => {
    throw new Error(`Not found "${specifier}"`);
  });

  userModule.evaluateSync();

  const defaultExport = await userModule.namespace.get('default', { reference: true });

  const data: any = await defaultExport.apply(null, [params], {
    arguments: { copy: true },
    result: { copy: true, promise: true },
  });

  console.log(logs);
  return { data };
}

const dataSource: ServerDataSource<{}, FunctionQuery, any> = {
  exec: execIsolatedVm,
};

export default dataSource;
