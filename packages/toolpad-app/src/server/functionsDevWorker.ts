import { Worker, MessageChannel, isMainThread, parentPort } from 'worker_threads';
import * as path from 'path';
import { createRequire } from 'node:module';
import * as fs from 'fs/promises';
import * as vm from 'vm';
import * as url from 'node:url';
import { ServerContext, getServerContext, withContext } from '@mui/toolpad-core/serverRuntime';
import { isWebContainer } from '@webcontainer/env';
import * as superjson from 'superjson';
import { createRpcClient, serveRpc } from '@mui/toolpad-utils/workerRpc';
import { workerData } from 'node:worker_threads';
import { ToolpadDataProviderIntrospection } from '@mui/toolpad-core/runtime';
import { TOOLPAD_DATA_PROVIDER_MARKER, ToolpadDataProvider } from '@mui/toolpad-core/server';
import * as z from 'zod';
import { fromZodError } from 'zod-validation-error';
import { GetRecordsParams, GetRecordsResult, PaginationMode } from '@mui/toolpad-core';

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

async function resolveExports(filePath: string): Promise<Map<string, unknown>> {
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

  return new Map(Object.entries(cachedModule.exports));
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
  const exports = await resolveExports(msg.filePath);

  const fn = exports.get(msg.name);
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

    const serializedResult = superjson.stringify(rawResult);

    return { result: serializedResult, newCookies: Array.from(newCookies.entries()) };
  } finally {
    functionFinished = true;
  }
}

const dataProviderSchema: z.ZodType<ToolpadDataProvider<any, any>> = z.object({
  paginationMode: z.enum(['index', 'cursor']).optional().default('index'),
  getRecords: z.function(z.tuple([z.any()]), z.any()),
  [TOOLPAD_DATA_PROVIDER_MARKER]: z.literal(true),
});

async function loadDataProvider(
  filePath: string,
  name: string,
): Promise<ToolpadDataProvider<any, any>> {
  const exports = await resolveExports(filePath);
  const dataProviderExport = exports.get(name);

  if (!dataProviderExport || typeof dataProviderExport !== 'object') {
    throw new Error(`DataProvider "${name}" not found`);
  }

  const parsed = dataProviderSchema.safeParse(dataProviderExport);

  if (parsed.success) {
    return parsed.data;
  }

  throw fromZodError(parsed.error);
}

async function introspectDataProvider(
  filePath: string,
  name: string,
): Promise<ToolpadDataProviderIntrospection> {
  const dataProvider = await loadDataProvider(filePath, name);

  return {
    paginationMode: dataProvider.paginationMode,
  };
}

async function getDataProviderRecords<R, P extends PaginationMode>(
  filePath: string,
  name: string,
  params: GetRecordsParams<R, P>,
): Promise<GetRecordsResult<R, P>> {
  const dataProvider = await loadDataProvider(filePath, name);

  return dataProvider.getRecords(params);
}

type WorkerRpcServer = {
  execute: typeof execute;
  introspectDataProvider: typeof introspectDataProvider;
  getDataProviderRecords: typeof getDataProviderRecords;
};

if (!isMainThread && parentPort) {
  serveRpc<WorkerRpcServer>(workerData.workerRpcPort, {
    execute,
    introspectDataProvider,
    getDataProviderRecords,
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

  const client = createRpcClient<WorkerRpcServer>(workerRpcChannel.port2);

  return {
    async terminate() {
      return worker.terminate();
    },

    async execute(filePath: string, name: string, parameters: unknown[]): Promise<any> {
      const ctx = getServerContext();

      const { result: serializedResult, newCookies } = await client.execute({
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

      const result = superjson.parse(serializedResult);

      return result;
    },

    async introspectDataProvider(
      filePath: string,
      name: string,
    ): Promise<ToolpadDataProviderIntrospection> {
      return client.introspectDataProvider(filePath, name);
    },

    async getDataProviderRecords<R, P extends PaginationMode>(
      filePath: string,
      name: string,
      params: GetRecordsParams<R, P>,
    ): Promise<GetRecordsResult<R, P>> {
      return client.getDataProviderRecords(filePath, name, params);
    },
  };
}

process.on('unhandledRejection', (error) => {
  console.error(error);
  process.exit(1);
});
