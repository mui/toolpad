import { once } from 'node:events';
import { Worker, MessageChannel, MessagePort, isMainThread, parentPort } from 'worker_threads';
import * as path from 'path';
import { createRequire } from 'node:module';
import * as fs from 'fs/promises';
import * as vm from 'vm';
import * as url from 'url';
import fetch, { Headers, Request, Response } from 'node-fetch';
import { errorFrom, serializeError } from '@mui/toolpad-utils/errors';
import invariant from 'invariant';

function getCircularReplacer() {
  const ancestors: object[] = [];
  return function replacer(this: object, key: string, value: unknown) {
    if (typeof value !== 'object' || value === null) {
      return value;
    }
    // `this` is the object that value is contained in,
    // i.e., its direct parent.
    while (ancestors.length > 0 && ancestors.at(-1) !== this) {
      ancestors.pop();
    }
    if (ancestors.includes(value)) {
      return '[Circular]';
    }
    ancestors.push(value);
    return value;
  };
}

type IntrospectedFiles = Map<string, { file: string }>;

interface IntrospectMessage {
  kind: 'introspect';
  files: IntrospectedFiles;
}

interface ExecuteMessage {
  kind: 'execute';
  filePath: string;
  name: string;
  parameters: unknown[];
}

type WorkerMessage = IntrospectMessage | ExecuteMessage;

type TransferredMessage = WorkerMessage & { port: MessagePort };

interface ModuleObject {
  exports: Record<string, unknown>;
}

const fileContents = new Map<string, string>();
const moduleCache = new Map<string, ModuleObject>();

function loadModule(fullPath: string, content: string) {
  const moduleRequire = createRequire(url.pathToFileURL(fullPath));
  const moduleObject: ModuleObject = { exports: {} };

  vm.runInThisContext(`((require, exports, module) => {\n${content}\n})`)(
    moduleRequire,
    moduleObject.exports,
    moduleObject,
  );

  return moduleObject;
}

async function resolveFunctions(filePath: string): Promise<Record<string, Function>> {
  const fullPath = path.resolve(filePath);
  const content = await fs.readFile(fullPath, 'utf-8');

  if (content !== fileContents.get(fullPath)) {
    moduleCache.delete(fullPath);
    fileContents.set(fullPath, content);
  }

  let cachedModule = moduleCache.get(fullPath);

  if (!cachedModule) {
    cachedModule = loadModule(fullPath, content);
    moduleCache.set(fullPath, cachedModule);
  }

  return Object.fromEntries(
    Object.entries(cachedModule.exports).flatMap(([key, value]) =>
      typeof value === 'function' ? [[key, value]] : [],
    ),
  );
}

async function execute(msg: ExecuteMessage) {
  const fns = await resolveFunctions(msg.filePath);

  const fn = fns[msg.name];
  if (typeof fn !== 'function') {
    throw new Error(`Function "${msg.name}" not found`);
  }

  const result = await fn(...msg.parameters);
  return result;
}

async function handleMessage(msg: WorkerMessage) {
  switch (msg.kind) {
    case 'execute':
      return execute(msg);
    default:
      throw new Error(`Unknown kind "${(msg as any).kind}"`);
  }
}

if (!isMainThread && parentPort) {
  // Polyfill fetch() in the Node.js environment
  if (!global.fetch) {
    // @ts-expect-error
    global.fetch = fetch;
    // @ts-expect-error
    global.Headers = Headers;
    // @ts-expect-error
    global.Request = Request;
    // @ts-expect-error
    global.Response = Response;
  }

  parentPort.on('message', (msg: TransferredMessage) => {
    (async () => {
      try {
        const result = await handleMessage(msg);
        msg.port.postMessage({ result: JSON.stringify(result, getCircularReplacer()) });
      } catch (rawError) {
        msg.port.postMessage({ error: serializeError(errorFrom(rawError)) });
      }
    })();
  });
}

export function createWorker(env: Record<string, any>) {
  invariant(isMainThread, 'createWorker() must be called from the main thread');

  const worker = new Worker(path.join(__dirname, 'functionsDevWorker.js'), { env });

  const runOnWorker = async (msg: WorkerMessage) => {
    const { port1, port2 } = new MessageChannel();
    worker.postMessage({ port: port1, ...msg } satisfies TransferredMessage, [port1]);
    const [{ error, result }] = await once(port2, 'message');

    if (error) {
      throw errorFrom(error);
    }

    return result ? JSON.parse(result) : undefined;
  };

  return {
    async terminate() {
      return worker.terminate();
    },

    async execute(filePath: string, name: string, parameters: unknown[]): Promise<any> {
      return runOnWorker({
        kind: 'execute',
        filePath,
        name,
        parameters,
      });
    },
  };
}

process.on('unhandledRejection', (error) => {
  console.error(error);
  process.exit(1);
});
