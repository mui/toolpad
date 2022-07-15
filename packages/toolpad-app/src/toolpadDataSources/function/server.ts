import ivm from 'isolated-vm';
import * as esbuild from 'esbuild';
import type * as harFormat from 'har-format';
import { withHar, createHarLog } from 'node-fetch-har';
import { ServerDataSource } from '../../types';
import {
  FunctionQuery,
  FunctionConnectionParams,
  FunctionResult,
  FunctionPrivateQuery,
} from './types';
import { Maybe } from '../../utils/types';
import { LogEntry } from '../../components/Console';

async function createPolyfillModule() {
  const { outputFiles } = await esbuild.build({
    entryPoints: [],
    bundle: true,
    format: 'esm',
    write: false,
    stdin: {
      resolveDir: __dirname,
      contents: `
        import 'fastestsmallesttextencoderdecoder';
        import { Headers } from 'headers-polyfill';
        import { URL, URLSearchParams } from 'whatwg-url';

        global.Headers = Headers;
        global.URL = URL;
        global.URLSearchParams = URLSearchParams;

        const __TOOLPAD_BRIDGE__ = global.__TOOLPAD_BRIDGE__


        function consoleMethod (level) {
          return (...args) => {
            __TOOLPAD_BRIDGE__.console.apply(null, [level, JSON.stringify(args)], { arguments: { copy: true }});
          }
        }
  
        global.console = {
          log: consoleMethod('log'),
          debug: consoleMethod('debug'),
          info: consoleMethod('info'),
          warn: consoleMethod('warn'),
          error: consoleMethod('error'),
        }


        global.setTimeout = (cb, ms) => {
          return __TOOLPAD_BRIDGE__.setTimeout.applySync(null, [cb, ms], { arguments: { reference: true }, result: { copy: true }});
        }
  
        global.clearTimeout = (timeout) => {
          return __TOOLPAD_BRIDGE__.clearTimeout.applyIgnored(null, [timeout], { arguments: { copy: true }});
        }


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
          get headers () {
            return new Headers(this[INTERNALS].getSync('headers').copy())
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
          response[INTERNALS] = await __TOOLPAD_BRIDGE__.fetch.apply(null, args, { arguments: { copy: true }, result: { promise: true }});
          return response;
        }
      `,
    },
  });
  const code = outputFiles?.[0].text || '';
  return code;
}

let cachedPolyfills: Promise<string> | undefined;
async function getRuntime() {
  if (!cachedPolyfills) {
    cachedPolyfills = createPolyfillModule();
  }
  return cachedPolyfills;
}

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
  const har: harFormat.Har = createHarLog();
  const instrumentedFetch: typeof fetch = withHar(fetch, { har });

  const fetchStub = new ivm.Reference((...args: Parameters<typeof fetch>) => {
    const req = new Request(...args);

    return instrumentedFetch(req).then(
      (res) => {
        const resHeadersInit = Array.from(res.headers.entries());

        return {
          ok: res.ok,
          status: res.status,
          statusText: res.statusText,
          headers: new ivm.ExternalCopy(resHeadersInit),
          json: new ivm.Reference(() => res.json()),
          text: new ivm.Reference(() => res.text()),
        };
      },
      (err) => {
        logs.push({
          timestamp: Date.now(),
          level: 'error',
          args: [{ name: err.name, message: err.message, stack: err.stack }],
        });

        throw err;
      },
    );
  });

  let nextTimeoutId = 1;
  const timeouts = new Map<number, NodeJS.Timeout>();

  const setTimeoutStub = (cb: ivm.Reference, ms: ivm.Reference) => {
    const id = nextTimeoutId;
    nextTimeoutId += 1;

    const timeout = setTimeout(() => {
      timeouts.delete(id);
      cb.applyIgnored(null, []);
    }, ms.copySync());

    timeouts.set(id, timeout);

    return id;
  };

  const clearTimeoutStub = (id: number) => {
    const timeout = timeouts.get(id);
    timeouts.delete(id);
    clearTimeout(timeout);
  };

  const consoleStub = (level: string, serializedArgs: string) => {
    logs.push({
      timestamp: Date.now(),
      level,
      args: JSON.parse(serializedArgs),
    });
  };

  await jail.set('__TOOLPAD_BRIDGE__', new ivm.ExternalCopy({}).copyInto());
  const bridge = await jail.get('__TOOLPAD_BRIDGE__');
  await bridge.set('fetch', fetchStub);
  await bridge.set('console', consoleStub);
  await bridge.set('setTimeout', setTimeoutStub);
  await bridge.set('clearTimeout', clearTimeoutStub);

  const runtime = await getRuntime();
  await context.evalClosure(runtime, []);

  await jail.delete('__TOOLPAD_BRIDGE__');

  let data;
  let error: Error | undefined;

  try {
    const { code: userModuleJs } = await esbuild.transform(functionQuery.module, {
      loader: 'ts',
    });

    const userModule = await isolate.compileModule(userModuleJs);

    await userModule.instantiate(context, (specifier) => {
      throw new Error(`Not found "${specifier}"`);
    });

    userModule.evaluateSync({ timeout: 30000 });

    const secrets = Object.fromEntries(connection?.secrets ?? []);

    const defaultExport = await userModule.namespace.get('default', { reference: true });
    data = await defaultExport.apply(null, [{ params, secrets }], {
      arguments: { copy: true },
      result: { copy: true, promise: true },
      timeout: 30000,
    });
  } catch (userError) {
    error = userError instanceof Error ? userError : new Error(String(userError));
  }

  return { data, logs, error, har };
}

async function execPrivate(
  connection: Maybe<FunctionConnectionParams>,
  query: FunctionPrivateQuery,
) {
  switch (query.kind) {
    case 'secretsKeys':
      return (connection?.secrets ?? []).map(([key]) => key);
    case 'debugExec':
      return execBase(connection, query.query, query.params);
    default:
      throw new Error(`Unknown private query "${(query as FunctionPrivateQuery).kind}"`);
  }
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

const dataSource: ServerDataSource<FunctionConnectionParams, FunctionQuery, any> = {
  exec,
  execPrivate,
};

export default dataSource;
