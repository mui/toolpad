import { once } from 'node:events';
import {
  Worker,
  MessageChannel,
  MessagePort,
  isMainThread,
  parentPort,
  workerData,
} from 'worker_threads';
import * as path from 'path';
import invariant from 'invariant';
import { createRequire } from 'node:module';
import * as fs from 'fs/promises';
import * as vm from 'vm';
import * as url from 'url';
import { TOOLPAD_FUNCTION } from '@mui/toolpad-core';
import fetch, { Headers, Request, Response } from 'node-fetch';

type IntrospectedFiles = Map<string, { file: string }>;

type WorkerMessage =
  | {
      response: MessagePort;
      kind: 'execute';
      filePath: string;
      name: string;
      parameters: Record<string, unknown>;
    }
  | {
      response: MessagePort;
      kind: 'introspect';
      files: IntrospectedFiles;
    };

export function createWorker(resourcesFolder: string, env: Record<string, any>) {
  const worker = new Worker(path.join(__dirname, 'functionsDevWorker.js'), {
    workerData: { resourcesFolder },
    env,
  });

  return {
    async introspect(files: IntrospectedFiles) {
      const responseChannel = new MessageChannel();
      worker.postMessage(
        {
          response: responseChannel.port1,
          kind: 'introspect',
          files,
        } satisfies WorkerMessage,
        [responseChannel.port1],
      );
      const [value] = await once(responseChannel.port2, 'message');
      return value;
    },

    async execute(
      filePath: string,
      name: string,
      parameters: Record<string, unknown>,
    ): Promise<any> {
      const responseChannel = new MessageChannel();
      worker.postMessage(
        {
          response: responseChannel.port1,
          kind: 'execute',
          filePath,
          name,
          parameters,
        } satisfies WorkerMessage,
        [responseChannel.port1],
      );
      const [value] = await once(responseChannel.port2, 'message');
      return value;
    },
  };
}

async function resolveFunctions(filePath: string): Promise<Record<string, Function>> {
  const fullPath = path.resolve(filePath);
  const content = await fs.readFile(fullPath, 'utf-8');
  const moduleRequire = createRequire(url.pathToFileURL(fullPath));
  const moduleObject: { exports: Record<string, unknown> } = { exports: {} };

  vm.runInThisContext(`
      ((require, exports, module) => {
        ${content}
      })
    `)(moduleRequire, moduleObject.exports, moduleObject);

  return Object.fromEntries(
    Object.entries(moduleObject.exports).flatMap(([key, value]) =>
      typeof value === 'function' ? [[key, value]] : [],
    ),
  );
}

async function execFunction(filePath: string, name: string, parameters: Record<string, unknown>) {
  const fns = await resolveFunctions(filePath);

  const fn = fns[name];
  if (typeof fn !== 'function') {
    throw new Error(`Function "${name}" not found`);
  }

  const data = await fn({ parameters });
  return data;
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

  parentPort.on('message', (msg: WorkerMessage) => {
    (async () => {
      const resourcesFolder = workerData.resourcesFolder;
      invariant(resourcesFolder, 'Missing resourcesFolder');
      switch (msg.kind) {
        case 'execute': {
          try {
            const data = await execFunction(msg.filePath, msg.name, msg.parameters);
            msg.response.postMessage({ data });
          } catch (error) {
            msg.response.postMessage({ error });
          }
          return;
        }
        case 'introspect': {
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

          const functions = Object.fromEntries(
            resolvedFiles.flatMap((resolvedFunctions) =>
              resolvedFunctions.map((resolver) => [resolver.name, resolver]),
            ),
          );

          msg.response.postMessage({ functions });
          return;
        }
        default:
          throw new Error(`Unknown kind "${(msg as any).kind}"`);
      }
    })();
  });
}
