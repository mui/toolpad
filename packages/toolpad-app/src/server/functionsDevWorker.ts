import { once } from 'node:events';
import { Worker, MessageChannel, MessagePort, isMainThread, parentPort } from 'worker_threads';
import * as path from 'path';
import { createRequire } from 'node:module';
import * as fs from 'fs/promises';
import * as vm from 'vm';
import * as url from 'url';
import { PrimitiveValueType, TOOLPAD_FUNCTION } from '@mui/toolpad-core';
import fetch, { Headers, Request, Response } from 'node-fetch';
import { errorFrom } from '@mui/toolpad-utils/errors';
import invariant from 'invariant';
import type { IntrospectionResult } from './functionsTypesWorker';

type IntrospectedFiles = Map<string, { file: string }>;

interface IntrospectMessage {
  kind: 'introspect';
  files: IntrospectedFiles;
}

interface ExecuteMessage {
  kind: 'execute';
  filePath: string;
  name: string;
  parameters: Record<string, unknown>;
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

  vm.runInThisContext(`
    ((require, exports, module) => {
      ${content}
    })
  `)(moduleRequire, moduleObject.exports, moduleObject);

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

  const data = await fn({ parameters: msg.parameters });
  return { data };
}

async function introspect(msg: IntrospectMessage): Promise<IntrospectionResult> {
  const resolvedFiles = await Promise.all(
    Array.from(msg.files.entries()).map(async ([entry, { file }]) => {
      const resolvers = await resolveFunctions(file).catch(() => ({}));
      return Object.entries(resolvers).map(([name, value]) => {
        const fnConfig = (value as any)[TOOLPAD_FUNCTION];
        return {
          name,
          file: path.basename(entry),
          parameters: fnConfig?.parameters ?? {},
        };
      });
    }),
  );

  const handlers = resolvedFiles.flatMap((resolvedFunctions) =>
    resolvedFunctions.map((resolver) => ({
      name: resolver.name,
      file: resolver.file,
      parameters: (Object.entries(resolver.parameters) as [string, PrimitiveValueType][]).map(
        ([name, propValueType]) => ({
          name,
          schema: { type: propValueType.type },
          optional: !propValueType.default,
        }),
      ),
      returnType: { schema: {} },
    })),
  );

  return { handlers };
}

async function handleMessage(msg: WorkerMessage) {
  switch (msg.kind) {
    case 'execute':
      return execute(msg);
    case 'introspect':
      return introspect(msg);
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
        msg.port.postMessage(result);
      } catch (rawError) {
        msg.port.postMessage({ error: errorFrom(rawError) });
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
    const [value] = await once(port2, 'message');
    return value;
  };

  return {
    async terminate() {
      return worker.terminate();
    },

    async introspect(files: IntrospectedFiles): Promise<IntrospectionResult> {
      return runOnWorker({
        kind: 'introspect',
        files,
      });
    },

    async execute(
      filePath: string,
      name: string,
      parameters: Record<string, unknown>,
    ): Promise<any> {
      return runOnWorker({
        kind: 'execute',
        filePath,
        name,
        parameters,
      });
    },
  };
}
