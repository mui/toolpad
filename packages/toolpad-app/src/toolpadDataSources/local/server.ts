import { ExecFetchResult, SerializedError } from '@mui/toolpad-core';
import * as child_process from 'child_process';
import * as esbuild from 'esbuild';
import * as fs from 'fs/promises';
import * as path from 'path';
import invariant from 'invariant';
import { indent } from '@mui/toolpad-core/utils/strings';
import * as dotenv from 'dotenv';
import config from '../../config';
import { ServerDataSource } from '../../types';
import { LocalPrivateQuery, LocalQuery, LocalConnectionParams } from './types';
import { Maybe } from '../../utils/types';
import { getUserProjectRoot, openCodeEditor, QUERIES_FILE } from '../../server/localMode';
import { errorFrom, serializeError } from '../../utils/errors';

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
  let builder: Promise<{
    sendRequest(msg: MessageToChildProcess): Promise<any>;
  }>;
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

function revalidate() {
  setInitialized();
}

async function execFunction(name: string, parameters: Record<string, unknown>) {
  const builder = await globalThis.builder;
  return builder.sendRequest({
    kind: 'exec',
    id: getNextId(),
    name,
    parameters,
  });
}

function formatCodeFrame(location: esbuild.Location): string {
  const lineNumberCharacters = Math.ceil(Math.log10(location.line));
  return [
    `${location.file}:${location.line}:${location.column}:`,
    `  ${location.line} │ ${location.lineText}`,
    `  ${' '.repeat(lineNumberCharacters)} ╵ ${' '.repeat(location.lineText.length - 1)}^`,
  ].join('\n');
}

async function introspect() {
  const builder = await globalThis.builder;
  return builder.sendRequest({
    kind: 'introspect',
    id: getNextId(),
  });
}

async function createMain(): Promise<string> {
  return `
    import { TOOLPAD_QUERY } from '@mui/toolpad-core';
    import { errorFrom, serializeError } from '@mui/toolpad-core/utils/errors';

    let resolversPromise
    async function getResolvers() {
      if (!resolversPromise) {
        resolversPromise = (async () => {
          const queries = await import(${JSON.stringify(QUERIES_FILE)})

          return new Map(Object.entries(queries).flatMap(([name, resolver]) => {
            return typeof resolver === 'function' ? [[name, resolver]] : []
          }))
        })()
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
              resolver[TOOLPAD_QUERY] || {}
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

async function createBuilder() {
  const userProjectRoot = getUserProjectRoot();
  let currentRuntimeProcess: child_process.ChildProcess | undefined;
  let controller: AbortController | undefined;
  let buildErrors: Error[] = [];
  let runtimeError: Error | undefined;

  let env: any = {};
  try {
    const envFileContent = await fs.readFile(path.resolve(userProjectRoot, '.env'));
    env = dotenv.parse(envFileContent) as any;
  } catch (err) {
    if (errorFrom(err).code !== 'ENOENT') {
      throw err;
    }
  }

  const toolpadPlugin: esbuild.Plugin = {
    name: 'toolpad',
    setup(build) {
      build.onResolve({ filter: /^toolpad:/ }, (args) => ({
        path: args.path.slice('toolpad:'.length),
        namespace: 'toolpad',
      }));

      build.onLoad({ filter: /.*/, namespace: 'toolpad' }, async (args) => {
        if (args.path === 'main.ts') {
          const contents = await createMain();
          return {
            loader: 'tsx',
            contents,
            resolveDir: userProjectRoot,
          };
        }

        throw new Error(`Can't resolve "${args.path}" for toolpad namespace`);
      });

      build.onEnd((args) => {
        // TODO: use for hot reloading
        // eslint-disable-next-line no-console
        console.log(`Rebuild: ${args.errors.length} error(s), ${args.warnings.length} warning(s)`);

        buildErrors = args.errors.map((message) => {
          let messageText = message.text;
          if (message.location) {
            const formattedLocation = indent(formatCodeFrame(message.location), 2);
            messageText = [messageText, formattedLocation].join('\n');
          }
          return new Error(messageText);
        });

        if (buildErrors.length <= 0) {
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

          controller = new AbortController();
          const metafile = args.metafile;
          invariant(metafile, 'esbuild settings should enable metafile');
          const outputFileNames = Object.keys(metafile.outputs);
          invariant(outputFileNames.length === 1, 'esbuild should build only one output file');
          const outputFile = outputFileNames[0];

          const runtimeProcess = child_process.fork(`./${outputFile}`, {
            cwd: userProjectRoot,
            silent: true,
            signal: controller.signal,
            stdio: 'inherit',
            env: {
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
        }

        revalidate();
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
    outfile: path.resolve(userProjectRoot, './.toolpad-generated/queries.js'),
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

  return {
    ctx,
    sendRequest,
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
    const data = await execFunction(localQuery.function, params);
    return { data };
  } catch (rawError) {
    return { error: serializeError(errorFrom(rawError)) };
  }
}

async function execPrivate(connection: Maybe<LocalConnectionParams>, query: LocalPrivateQuery) {
  switch (query.kind) {
    case 'introspection':
      return introspect();
    case 'debugExec':
      return execBase(connection, query.query, query.params);
    case 'openEditor':
      return openCodeEditor(QUERIES_FILE);
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
  await builder.ctx.watch();
  return builder;
}

if (config.localMode) {
  globalThis.builder = globalThis.builder || startDev();
}
