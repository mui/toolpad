import { ExecFetchResult, SerializedError } from '@mui/toolpad-core';
import * as child_process from 'child_process';
import * as esbuild from 'esbuild';
import * as path from 'path';
import * as fs from 'fs/promises';
import invariant from 'invariant';
import { ServerDataSource } from '../../types';
import { LocalPrivateQuery, LocalQuery, LocalConnectionParams } from './types';
import { Maybe } from '../../utils/types';
import { getUserProjectRoot } from '../../server/localMode';
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
  // Used to detect old esbuild context to be cleaned up after HMR
  let localFunctionsEsbuildContext: esbuild.BuildContext | undefined;
  // Used to detect old childprocess to be cleaned up after HMR
  let localFunctionsChildProcessController: AbortController | undefined;
}

const QUERIES_FOLDER = 'toolpad-queries';

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
let cp: child_process.ChildProcess | undefined;
let buildErrors: Error[] = [];

async function sendRequest(msg: MessageToChildProcess) {
  return new Promise((resolve, reject) => {
    if (buildErrors.length > 0) {
      const firstError = buildErrors[0];
      reject(firstError);
    } else if (cp) {
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
      cp.send(msg);
    } else {
      reject(new Error(`Not initialized`));
    }
  });
}

async function execFunction(name: string, parameters: Record<string, unknown>) {
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

async function createMain(userProjectRoot: string): Promise<string> {
  const functionsFolder = path.resolve(userProjectRoot, `./${QUERIES_FOLDER}`);
  const entries = await fs.readdir(functionsFolder, {
    withFileTypes: true,
  });
  const imports = entries
    .map((entry) => {
      if (entry.isFile()) {
        const name = entry.name.replace(/\..+$/, '');
        const filePath = `./${path.join(`./${QUERIES_FOLDER}`, entry.name)}`;
        return `[
        ${JSON.stringify(name)},
        () =>  import(${JSON.stringify(filePath)})
      ]`;
      }

      return null;
    })
    .filter(Boolean);

  return `
    import { TOOLPAD_QUERY } from '@mui/toolpad-core';
    import { errorFrom, serializeError } from '@mui/toolpad-core/utils/errors';

    const resolvers = new Map([
      ${imports.join(',\n')}
    ])

    async function loadResolver (name) {
      const importModule = resolvers.get(name)

      if (!importModule) {
        throw new Error(\`Can't resolve "\${name}"\`);
      }

      const { default: resolver } = await importModule();

      if (!resolver) {
        throw new Error(\`Can't resolve "\${name}"\`);
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
            const resolvedResolvers = await Promise.all(Array.from(resolvers.keys(), async (name) => {
              const resolver = await loadResolver(name)
              return [name, resolver[TOOLPAD_QUERY]];
            }));
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

async function createEsbuildContext() {
  const userProjectRoot = getUserProjectRoot();

  const toolpadPlugin: esbuild.Plugin = {
    name: 'toolpad',
    setup(build) {
      build.onResolve({ filter: /^toolpad:/ }, (args) => ({
        path: args.path.slice('toolpad:'.length),
        namespace: 'toolpad',
      }));

      build.onLoad({ filter: /.*/, namespace: 'toolpad' }, async (args) => {
        if (args.path === 'main.tsx') {
          const contents = await createMain(userProjectRoot);
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
          return new Error(message.text);
        });

        if (buildErrors.length > 0) {
          return;
        }

        if (globalThis.localFunctionsChildProcessController) {
          globalThis.localFunctionsChildProcessController.abort();
          globalThis.localFunctionsChildProcessController = undefined;

          // clean up handlers
          for (const [id, execution] of pendingExecutions) {
            execution.reject(new Error(`Aborted`));
            clearTimeout(execution.timeout);
            pendingExecutions.delete(id);
          }
        }

        const controller = new AbortController();
        const metafile = args.metafile;
        invariant(metafile, 'esbuild settings should enable metafile');
        const outputFileNames = Object.keys(metafile.outputs);
        invariant(outputFileNames.length === 1, 'esbuild should build only one output file');
        const outputFile = outputFileNames[0];
        cp = child_process.fork(`./${outputFile}`, {
          cwd: userProjectRoot,
          signal: controller.signal,
          stdio: 'inherit',
        });

        cp.on('error', (error) => {
          if (error.name === 'AbortError') {
            return;
          }
          console.error(error);
        });

        cp.on('message', (msg: MessageFromChildProcess) => {
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

        globalThis.localFunctionsChildProcessController = controller;
      });
    },
  };

  const ctx = esbuild.context({
    absWorkingDir: userProjectRoot,
    entryPoints: ['toolpad:main.tsx'],
    plugins: [toolpadPlugin],
    write: true,
    bundle: true,
    metafile: true,
    outdir: path.resolve(userProjectRoot, './.toolpad-generated/functions'),
    target: 'es2022',
  });

  return ctx;
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
  if (globalThis.localFunctionsEsbuildContext) {
    await globalThis.localFunctionsEsbuildContext.dispose();
  }
  const ctx = await createEsbuildContext();
  await ctx.watch();
  globalThis.localFunctionsEsbuildContext = ctx;
}

startDev();
