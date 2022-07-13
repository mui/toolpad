import ivm from 'isolated-vm';
import { transform } from 'esbuild';
import { ServerDataSource } from '../../types';
import { FunctionQuery, FunctionConnectionParams, FunctionResult, LogEntry } from './types';
import { Maybe } from '../../utils/types';

const isolate = new ivm.Isolate({ memoryLimit: 128 });

async function execBase(
  connection: Maybe<FunctionConnectionParams>,
  functionQuery: FunctionQuery,
  params: Record<string, string>,
): Promise<FunctionResult> {
  const context = isolate.createContextSync();
  const jail = context.global;
  jail.setSync('global', jail.derefInto());

  const logs: LogEntry[] = [];

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
        response[INTERNALS] = await $0.apply(null, args, { arguments: { copy: true }, result: { promise: true }});
        return response;
      }
    `,
    [
      new ivm.Reference((...args: Parameters<typeof fetch>) => {
        const req = new Request(...args);

        logs.push({
          timestamp: Date.now(),
          kind: 'request',
          request: {
            method: req.method,
            url: req.url,
            headers: Array.from(req.headers.entries()),
          },
        });

        return fetch(req).then(
          (res) => {
            logs.push({
              timestamp: Date.now(),
              kind: 'response',
              response: {
                status: res.status,
                statusText: res.statusText,
                ok: res.ok,
                headers: Array.from(res.headers.entries()),
              },
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
              kind: 'console',
              args: [{ name: err.name, message: err.message }],
            });

            throw err;
          },
        );
      }),
    ],
    {},
  );

  let data;
  let error: Error | undefined;

  try {
    const { code: userModuleJs } = await transform(functionQuery.module, {
      loader: 'ts',
    });

    const userModule = await isolate.compileModule(userModuleJs);

    await userModule.instantiate(context, (specifier) => {
      throw new Error(`Not found "${specifier}"`);
    });

    userModule.evaluateSync();

    const defaultExport = await userModule.namespace.get('default', { reference: true });

    data = await defaultExport.apply(null, [{ params }], {
      arguments: { copy: true },
      result: { copy: true, promise: true },
    });
  } catch (userError) {
    error = userError instanceof Error ? userError : new Error(String(userError));
  }

  return { data, logs, error };
}

async function execPrivate(
  connection: Maybe<FunctionConnectionParams>,
  query: { query: FunctionQuery; params: Record<string, any> },
) {
  return execBase(connection, query.query, query.params);
}

async function exec(
  connection: Maybe<FunctionConnectionParams>,
  functionQuery: FunctionQuery,
  params: Record<string, string>,
) {
  const { data, error } = await execBase(connection, functionQuery, params);
  if (error) {
    throw error;
  }
  return { data };
}

const dataSource: ServerDataSource<{}, FunctionQuery, any> = {
  exec,
  execPrivate,
};

export default dataSource;
