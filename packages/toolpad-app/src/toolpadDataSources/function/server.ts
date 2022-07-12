import ivm from 'isolated-vm';
import { ServerDataSource, ApiResult } from '../../types';
import { FunctionQuery, FunctionConnectionParams } from './types';
import { Maybe } from '../../utils/types';

const isolate = new ivm.Isolate({ memoryLimit: 128 });

export async function execQuery(
  connection: Maybe<FunctionConnectionParams>,
  functionQuery: FunctionQuery,
  params: Record<string, string>,
): Promise<ApiResult<any>> {
  const context = isolate.createContextSync();
  const jail = context.global;
  jail.setSync('global', jail.derefInto());

  const logs: { timestamp: number; level: string; kind: 'console' | 'fetch'; args: any[] }[] = [];

  await context.evalClosure(
    `
      function consoleMethod (level) {
        return (...args) => {
          $0.apply(null, [level, JSON.stringify(args)], { arguments: { copy: true }});
        }
      }

      global.console = {
        log: consoleMethod('log'),
        debug: consoleMethod('debug'),
        info: consoleMethod('info'),
        warn: consoleMethod('warn'),
        error: consoleMethod('error'),
      }
    `,
    [
      (level: string, serializedArgs: string) => {
        logs.push({
          timestamp: Date.now(),
          level,
          kind: 'console',
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
        logs.push({
          timestamp: Date.now(),
          level: 'log',
          kind: 'fetch',
          args: [`Request "${args[0]}"`],
        });

        return fetch(...args).then(
          (res) => {
            logs.push({
              timestamp: Date.now(),
              level: 'log',
              kind: 'fetch',
              args: [`Response ${res.status}: ${res.statusText}`],
            });

            return {
              ok: res.ok,
              status: res.status,
              statusText: res.statusText,
              json: new ivm.Reference(() => res.json()),
              text: new ivm.Reference(() => res.text()),
            };
          },
          (err) => {
            logs.push({
              timestamp: Date.now(),
              level: 'error',
              kind: 'fetch',
              args: [{ name: err.name, message: err.message }],
            });

            throw err;
          },
        );
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
  return { data, logs };
}

async function execPrivate(connection, query) {
  return execBase(connection, query.query, query.parameters);
}

async function exec(...args) {
  const { data } = await execBase(...args);
  return { data };
}

const dataSource: ServerDataSource<{}, FunctionQuery, any> = {
  exec,
  execPrivate,
};

export default dataSource;
