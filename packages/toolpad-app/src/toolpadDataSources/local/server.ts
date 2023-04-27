import { ExecFetchResult } from '@mui/toolpad-core';
import { SerializedError, errorFrom, serializeError } from '@mui/toolpad-utils/errors';
import * as child_process from 'child_process';
import * as esbuild from 'esbuild';
import * as fs from 'fs/promises';
import * as path from 'path';
import invariant from 'invariant';
import { indent, truncate } from '@mui/toolpad-utils/strings';
import * as dotenv from 'dotenv';
import * as chokidar from 'chokidar';
import chalk from 'chalk';
import config from '../../config';
import { ServerDataSource } from '../../types';
import { LocalPrivateQuery, LocalQuery, LocalConnectionParams } from './types';
import { Maybe } from '../../utils/types';
import {
  getUserProjectRoot,
  openQueryEditor,
  getFunctionsFile,
  getOutputFolder,
} from '../../server/localMode';
import { waitForInit } from '../../server/liveProject';

type MessageToChildProcess =
  | {
      kind: 'introspect';
      id: number;
    }
  | {
      kind: 'exec';
      id: number;
      name: string;
      parameters: Record<string, any>;
    };

type MessageFromChildProcess = {
  kind: 'result';
  id: number;
  data: unknown;
  error: SerializedError;
};

declare module globalThis {
  let builder: Promise<ReturnType<typeof createBuilder>>;
}

let nextMsgId = 1;

function getNextId() {
  const id = nextMsgId;
  nextMsgId += 1;
  return id;
}

interface Execution {
  id: number;
  reject: (err: Error) => void;
  resolve: (result: any) => void;
  timeout: NodeJS.Timeout;
}

const pendingExecutions = new Map<number, Execution>();

let setInitialized: () => void;
const initPromise = new Promise<void>((resolve) => {
  setInitialized = resolve;
});

function formatCodeFrame(location: esbuild.Location): string {
  const lineNumberCharacters = Math.ceil(Math.log10(location.line));
  return [
    `${location.file}:${location.line}:${location.column}:`,
    `  ${location.line} │ ${location.lineText}`,
    `  ${' '.repeat(lineNumberCharacters)} ╵ ${' '.repeat(
      Math.max(location.lineText.length - 1, 0),
    )}^`,
  ].join('\n');
}

function pathToNodeImportSpecifier(importPath: string): string {
  const normalized = path.normalize(importPath).split(path.sep).join('/');
  return normalized.startsWith('/') ? normalized : `./${normalized}`;
}

async function createMain(): Promise<string> {
  const relativeFunctionsFilePath = [`.`, getFunctionsFile('.')].join(path.sep);
  return `
    import { TOOLPAD_FUNCTION } from '@mui/toolpad-core/server';
    import { errorFrom, serializeError } from '@mui/toolpad-utils/errors';
    import fetch, { Headers, Request, Response } from 'node-fetch'

    // Polyfill fetch() in the Node.js environment
    if (!global.fetch) {
      global.fetch = fetch
      global.Headers = Headers
      global.Request = Request
      global.Response = Response
    }

    async function loadFunction (name, importFn) {
      const { default: resolver } = await importFn()
      return [name, resolver]
    }

    let resolversPromise
    async function getResolvers() {
      if (!resolversPromise) {
        resolversPromise = (async () => {
          const functions = await import(${JSON.stringify(
            pathToNodeImportSpecifier(relativeFunctionsFilePath),
          )}).catch((err) => {
            console.error(err);
            return {};
          });

          const functionsFileResolvers = Object.entries(functions).flatMap(([name, resolver]) => {
            return typeof resolver === 'function' ? [[name, resolver]] : []
          })

          return new Map(functionsFileResolvers);
        })();
      }
      return resolversPromise
    }

    async function loadResolver (name) {
      const resolvers = await getResolvers()

      const resolver = resolvers.get(name);

      if (!resolver) {
        throw new Error(\`Can't find "\${name}"\`);
      }

      return resolver
    }

    async function execResolver (name, parameters) {
      const resolver = await loadResolver(name);
      return resolver({ parameters })
    }

    process.on('message', async msg => {
      switch (msg.kind) {
        case 'exec': {
          let data, error;
          try {
            data = await execResolver(msg.name, msg.parameters);
          } catch (err) {
            error =  serializeError(errorFrom(err))
          }
          process.send({
            kind: 'result',
            id: msg.id,
            data,
            error
          });
          break;
        }
        case 'introspect': {
          let data, error
          try {
            const resolvers = await getResolvers()
            const resolvedResolvers =  Array.from(resolvers, ([name, resolver]) => [
              name,
              resolver[TOOLPAD_FUNCTION] || {}
            ]);
            data = { 
              functions: Object.fromEntries(resolvedResolvers.filter(Boolean))
            };
          } catch (err) {
            error =  serializeError(errorFrom(err))
          }
          process.send({
            kind: 'result',
            id: msg.id,
            data,
            error
          });
          break;
        }
        default: console.log(\`Unknown message kind "\${msg.kind}"\`);
      }
    });
  `;
}

export async function loadEnvFile() {
  const userProjectRoot = getUserProjectRoot();
  const envFilePath = path.resolve(userProjectRoot, '.env');

  try {
    const envFileContent = await fs.readFile(envFilePath);
    const parsed = dotenv.parse(envFileContent) as any;
    // eslint-disable-next-line no-console
    console.log(
      `${chalk.blue('info')}  - loaded env file "${envFilePath}" with keys ${truncate(
        Object.keys(parsed).join(', '),
        1000,
      )}`,
    );

    return parsed;
  } catch (err) {
    if (errorFrom(err).code !== 'ENOENT') {
      throw err;
    }
  }

  return {};
}

async function createBuilder() {
  await waitForInit();

  const userProjectRoot = getUserProjectRoot();

  let currentRuntimeProcess: child_process.ChildProcess | undefined;
  let controller: AbortController | undefined;
  let buildErrors: Error[] = [];
  let runtimeError: Error | undefined;

  let outputFile: string | undefined;
  let metafile: esbuild.Metafile | undefined;
  let env: any = loadEnvFile();

  const restartRuntimeProcess = () => {
    if (controller) {
      controller.abort();
      controller = undefined;

      // clean up handlers
      for (const [id, execution] of pendingExecutions) {
        execution.reject(new Error(`Aborted`));
        clearTimeout(execution.timeout);
        pendingExecutions.delete(id);
      }
    }

    if (!outputFile) {
      return;
    }

    controller = new AbortController();

    const runtimeProcess = child_process.fork(`./${outputFile}`, {
      cwd: userProjectRoot,
      silent: true,
      signal: controller.signal,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: config.cmd === 'start' ? 'production' : 'development',
        ...env,
      },
    });

    runtimeError = undefined;

    runtimeProcess.on('error', (error) => {
      if (error.name === 'AbortError') {
        return;
      }
      runtimeError = error;
      console.error(`cp ${runtimeProcess.pid} error`, error);
    });

    runtimeProcess.on('exit', (code) => {
      if (currentRuntimeProcess === runtimeProcess) {
        currentRuntimeProcess = undefined;
        if (code !== 0) {
          runtimeError = new Error(`The runtime process exited with code ${code}`);
          if (config.cmd === 'start') {
            console.error(`The runtime process exited with code ${code}`);
            process.exit(1);
          }
        }
      }
    });

    runtimeProcess.on('message', (msg: MessageFromChildProcess) => {
      switch (msg.kind) {
        case 'result': {
          const execution = pendingExecutions.get(msg.id);
          if (execution) {
            pendingExecutions.delete(msg.id);
            clearTimeout(execution.timeout);
            if (msg.error) {
              execution.reject(new Error(msg.error.message || 'Unknown error'));
            } else {
              execution.resolve(msg.data);
            }
          }
          break;
        }
        default:
          console.error(`Unknowm message received "${msg.kind}"`);
      }
    });

    currentRuntimeProcess = runtimeProcess;
  };

  const toolpadPlugin: esbuild.Plugin = {
    name: 'toolpad',
    setup(build) {
      build.onResolve({ filter: /^toolpad:/ }, (args) => ({
        path: args.path.slice('toolpad:'.length),
        namespace: 'toolpad',
      }));

      build.onLoad({ filter: /.*/, namespace: 'toolpad' }, async (args) => {
        if (args.path === 'main.ts') {
          return {
            loader: 'tsx',
            contents: await createMain(),
            resolveDir: userProjectRoot,
          };
        }

        throw new Error(`Can't resolve "${args.path}" for toolpad namespace`);
      });

      build.onEnd((args) => {
        // TODO: use for hot reloading
        // eslint-disable-next-line no-console
        console.log(
          `${chalk.green('ready')} - built functions.ts: ${args.errors.length} error(s), ${
            args.warnings.length
          } warning(s)`,
        );

        buildErrors = args.errors.map((message) => {
          let messageText = message.text;
          if (message.location) {
            const formattedLocation = indent(formatCodeFrame(message.location), 2);
            messageText = [messageText, formattedLocation].join('\n');
          }
          return new Error(messageText);
        });

        if (buildErrors.length <= 0) {
          metafile = args.metafile;
          invariant(metafile, 'esbuild settings should enable metafile');
          const mainEntry = Object.entries(metafile.outputs).find(
            ([, entry]) => entry.entryPoint === 'toolpad:main.ts',
          );
          invariant(mainEntry, 'No output found for main entry point');
          outputFile = mainEntry[0];

          restartRuntimeProcess();
        }

        setInitialized();
      });
    },
  };

  const ctx = await esbuild.context({
    absWorkingDir: userProjectRoot,
    entryPoints: ['toolpad:main.ts'],
    plugins: [toolpadPlugin],
    write: true,
    bundle: true,
    metafile: true,
    outdir: path.resolve(getOutputFolder(userProjectRoot), 'functions'),
    platform: 'node',
    packages: 'external',
    target: 'es2022',
  });

  async function sendRequest(msg: MessageToChildProcess) {
    await initPromise;
    return new Promise((resolve, reject) => {
      if (buildErrors.length > 0) {
        const firstError = buildErrors[0];
        reject(firstError);
      } else if (runtimeError) {
        reject(runtimeError);
      } else if (currentRuntimeProcess) {
        const timeout = setTimeout(() => {
          pendingExecutions.delete(msg.id);
          reject(new Error(`Timeout`));
        }, 60000);
        pendingExecutions.set(msg.id, {
          id: msg.id,
          resolve,
          reject,
          timeout,
        });
        currentRuntimeProcess.send(msg);
      } else {
        reject(new Error(`Toolpad local runtime is not running`));
      }
    });
  }

  async function execute(name: string, parameters: Record<string, unknown>) {
    return sendRequest({
      kind: 'exec',
      id: getNextId(),
      name,
      parameters,
    });
  }

  async function introspect() {
    return sendRequest({
      kind: 'introspect',
      id: getNextId(),
    });
  }

  let envFileWatcher: chokidar.FSWatcher | undefined;

  const envFilePath = path.resolve(userProjectRoot, '.env');

  return {
    watch() {
      ctx.watch();

      (async () => {
        try {
          if (envFileWatcher) {
            await envFileWatcher.close();
          }

          envFileWatcher = chokidar.watch([envFilePath]);
          envFileWatcher.on('all', async () => {
            env = await loadEnvFile();
            restartRuntimeProcess();
          });
        } catch (err: unknown) {
          if (errorFrom(err).name === 'AbortError') {
            return;
          }
          throw err;
        }
      })();
    },
    introspect,
    execute,
    async dispose() {
      await Promise.all([ctx.dispose(), envFileWatcher?.close(), controller?.abort()]);
    },
  };
}

async function execBase(
  connection: Maybe<LocalConnectionParams>,
  localQuery: LocalQuery,
  params: Record<string, string>,
) {
  if (!localQuery.function) {
    throw new Error(`No function name chosen`);
  }
  try {
    const builder = await globalThis.builder;
    const data = await builder.execute(localQuery.function, params);
    return { data };
  } catch (rawError) {
    return { error: serializeError(errorFrom(rawError)) };
  }
}

async function execPrivate(connection: Maybe<LocalConnectionParams>, query: LocalPrivateQuery) {
  switch (query.kind) {
    case 'introspection': {
      const builder = await globalThis.builder;
      const introspectionResult = await builder.introspect();
      return introspectionResult;
    }
    case 'debugExec':
      return execBase(connection, query.query, query.params);
    case 'openEditor':
      return openQueryEditor();
    default:
      throw new Error(`Unknown private query "${(query as LocalPrivateQuery).kind}"`);
  }
}

async function exec(
  connection: Maybe<LocalConnectionParams>,
  fetchQuery: LocalQuery,
  params: Record<string, string>,
): Promise<ExecFetchResult<any>> {
  const { data, error } = await execBase(connection, fetchQuery, params);
  return { data, error };
}

const dataSource: ServerDataSource<{}, LocalQuery, any> = {
  exec,
  execPrivate,
};

export default dataSource;

async function startDev() {
  const builder = await createBuilder();
  await builder.watch();
  return builder;
}

globalThis.builder = globalThis.builder || startDev();
