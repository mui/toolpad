import { Worker, MessageChannel, isMainThread, parentPort } from 'worker_threads';
import * as path from 'path';
import { createRequire } from 'node:module';
import * as fs from 'fs/promises';
import * as vm from 'vm';
import * as url from 'node:url';
import { getCircularReplacer, replaceRecursive } from '@mui/toolpad-utils/json';
import { ServerContext, getServerContext, withContext } from '@mui/toolpad-core/serverRuntime';
import { isWebContainer } from '@webcontainer/env';
import SuperJSON from 'superjson';
import { createRpcClient, serveRpc } from '@mui/toolpad-utils/workerRpc';
import { workerData } from 'node:worker_threads';

import.meta.url ??= url.pathToFileURL(__filename).toString();
const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

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

interface ExecuteParams {
  filePath: string;
  name: string;
  parameters: unknown[];
  cookies?: Record<string, string>;
}

interface ExecuteResult {
  result: string;
  newCookies: [string, string][];
}

async function execute(msg: ExecuteParams): Promise<ExecuteResult> {
  const fns = await resolveFunctions(msg.filePath);

  const fn = fns[msg.name];
  if (typeof fn !== 'function') {
    throw new Error(`Function "${msg.name}" not found`);
  }

  let functionFinished = false;

  try {
    const newCookies = new Map<string, string>();

    const ctx: ServerContext = {
      cookies: msg.cookies || {},
      setCookie(name: string, value: string) {
        if (functionFinished) {
          throw new Error(`setCookie can't be called after the function has finished executing.`);
        }
        newCookies.set(name, value);
      },
    };

    const shouldBypassContext = isWebContainer();

    if (shouldBypassContext) {
      console.warn(
        'Bypassing server context in web containers, see https://github.com/stackblitz/core/issues/2711',
      );
    }

    const rawResult = shouldBypassContext
      ? await fn(...msg.parameters)
      : await withContext(ctx, async () => fn(...msg.parameters));

    const withoutCircularRefs = replaceRecursive(rawResult, getCircularReplacer());
    const serializedResult = SuperJSON.stringify(withoutCircularRefs);

    return { result: serializedResult, newCookies: Array.from(newCookies.entries()) };
  } finally {
    functionFinished = true;
  }
}

type WorkerRpcServer = {
  execute: typeof execute;
};

if (!isMainThread && parentPort) {
  serveRpc<WorkerRpcServer>(workerData.workerRpcPort, {
    execute,
  });
}

export function createWorker(env: Record<string, any>) {
  const workerRpcChannel = new MessageChannel();
  const worker = new Worker(path.resolve(currentDirectory, '../cli/functionsDevWorker.js'), {
    env,
    workerData: {
      workerRpcPort: workerRpcChannel.port1,
    },
    transferList: [workerRpcChannel.port1],
  });

  const client = createRpcClient(workerRpcChannel.port2);

  return {
    async terminate() {
      return worker.terminate();
    },

    async execute(filePath: string, name: string, parameters: unknown[]): Promise<any> {
      const ctx = getServerContext();

      const { result: serializedResult, newCookies } = await client.execute({
        kind: 'execute',
        filePath,
        name,
        parameters,
        cookies: ctx?.cookies,
      });

      if (ctx) {
        for (const [cookieName, cookieValue] of newCookies) {
          ctx.setCookie(cookieName, cookieValue);
        }
      }

      const result = SuperJSON.parse(serializedResult);

      return result;
    },
  };
}

process.on('unhandledRejection', (error) => {
  console.error(error);
  process.exit(1);
});
