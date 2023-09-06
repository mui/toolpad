import { once } from 'node:events';
import { Worker, MessageChannel, MessagePort, isMainThread, parentPort } from 'worker_threads';
import * as path from 'path';
import { createRequire } from 'node:module';
import * as fs from 'fs/promises';
import * as vm from 'vm';
import * as url from 'url';
import fetch, { Headers, Request, Response } from 'node-fetch';
import { errorFrom, serializeError } from '@mui/toolpad-utils/errors';
import { getCircularReplacer, replaceRecursive } from '@mui/toolpad-utils/json';
import { ServerContext, getServerContext, withContext } from '@mui/toolpad-core/serverRuntime';
import invariant from 'invariant';
import { isWebContainer } from '@webcontainer/env';
import SuperJSON from 'superjson';

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
  ctx?: ServerContext;
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
  if (!msg.ctx && isWebContainer()) {
    console.warn(
      'Bypassing server context in web containers, see https://github.com/stackblitz/core/issues/2711',
    );
    return fn(...msg.parameters);
  }

  invariant(msg.ctx, 'Server context is required');
  const result = await withContext(msg.ctx, async () => {
    return fn(...msg.parameters);
  });

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
        const rawResult = await handleMessage(msg);
        const withoutCircularRefs = replaceRecursive(rawResult, getCircularReplacer());
        const serializedResult = SuperJSON.serialize(withoutCircularRefs);
        msg.port.postMessage({ result: serializedResult });
      } catch (rawError) {
        msg.port.postMessage({ error: serializeError(errorFrom(rawError)) });
      }
    })();
  });
}

export function createWorker(env: Record<string, any>) {
  const worker = new Worker(path.join(__dirname, 'functionsDevWorker.js'), { env });

  const runOnWorker = async (msg: WorkerMessage) => {
    const { port1, port2 } = new MessageChannel();
    worker.postMessage({ port: port1, ...msg } satisfies TransferredMessage, [port1]);
    const [{ error, result: serializedResult }] = await once(port2, 'message');

    if (error) {
      throw errorFrom(error);
    }

    const result = SuperJSON.deserialize(serializedResult);
    return result;
  };

  return {
    async terminate() {
      return worker.terminate();
    },

    async execute(filePath: string, name: string, parameters: unknown[]): Promise<any> {
      const ctx = getServerContext();
      return runOnWorker({
        kind: 'execute',
        filePath,
        name,
        parameters,
        ctx,
      });
    },
  };
}

process.on('unhandledRejection', (error) => {
  console.error(error);
  process.exit(1);
});
