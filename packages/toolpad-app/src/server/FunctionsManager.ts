import { Emitter } from '@mui/toolpad-utils/events';
import type { Message as MessageToChildProcess } from '@mui/toolpad-core/localRuntime';
import { SerializedError, errorFrom, serializeError } from '@mui/toolpad-utils/errors';
import * as child_process from 'child_process';
import * as esbuild from 'esbuild';
import * as path from 'path';
import invariant from 'invariant';
import { indent } from '@mui/toolpad-utils/strings';
import * as chokidar from 'chokidar';
import chalk from 'chalk';
import { glob } from 'glob';
import * as fs from 'fs/promises';
import EnvManager from './EnvManager';
import { ProjectEvents, ToolpadProjectOptions } from '../types';
import config from '../config';
import { writeFileRecursive, fileExists } from '../utils/fs';

const DEFAULT_FUNCTIONS_FILE_CONTENT = `// Toolpad queries:

export async function example() {
  return [
    { firstname: 'Nell', lastName: 'Lester' },
    { firstname: 'Keanu', lastName: 'Walter' },
    { firstname: 'Daniella', lastName: 'Sweeney' },
  ];
}
`;

type MessageFromChildProcess = {
  kind: 'result';
  id: number;
  data: unknown;
  error: SerializedError;
};

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

interface Builder {
  watch(): void;
  introspect: () => Promise<unknown>;
  execute: (name: string, parameters: Record<string, unknown>) => Promise<unknown>;
  dispose(): Promise<void>;
}

interface IToolpadProject {
  options: ToolpadProjectOptions;
  events: Emitter<ProjectEvents>;
  getRoot(): string;
  getToolpadFolder(): string;
  getOutputFolder(): string;
  openCodeEditor(path: string): Promise<void>;
  envManager: EnvManager;
}

export default class FunctionsManager {
  private project: IToolpadProject;

  private builder: Promise<Builder>;

  constructor(project: IToolpadProject) {
    this.project = project;
    this.builder = this.startDev();
  }

  getResourcesFolder(): string {
    return path.join(this.project.getToolpadFolder(), './resources');
  }

  getFunctionsFile() {
    return path.join(this.getResourcesFolder(), './functions.ts');
  }

  getFunctionResourcesPattern(): string {
    return path.join(this.getResourcesFolder(), 'functions.ts');
  }

  private async migrateLegacy() {
    const legacyQueriesFile = path.resolve(this.project.getToolpadFolder(), 'queries.ts');
    if (await fileExists(legacyQueriesFile)) {
      const functionsFile = this.getFunctionsFile();
      await fs.mkdir(path.dirname(functionsFile), { recursive: true });
      await fs.rename(legacyQueriesFile, functionsFile);
    }
  }

  async createMain(): Promise<string> {
    const resourcesFolder = this.getResourcesFolder();
    const functionFiles = await glob(this.getFunctionResourcesPattern());

    const relativeResourcesFolder = path.relative(this.project.getRoot(), resourcesFolder);

    const functionImports = functionFiles.map((file) => {
      const fileName = path.relative(resourcesFolder, file);
      const importSpec = pathToNodeImportSpecifier(
        ['.', relativeResourcesFolder, fileName].join(path.sep),
      );
      const name = path.basename(fileName).replace(/\..*$/, '');
      return `[${JSON.stringify(name)}, () => import(${JSON.stringify(importSpec)})]`;
    });

    return `
    import fetch, { Headers, Request, Response } from 'node-fetch'
    import { setup } from '@mui/toolpad-core/localRuntime';

    // Polyfill fetch() in the Node.js environment
    if (!global.fetch) {
      global.fetch = fetch
      global.Headers = Headers
      global.Request = Request
      global.Response = Response
    }

    setup({
      functions: new Map([${functionImports.join(', ')}]),
    })
  `;
  }

  async createBuilder() {
    const root = this.project.getRoot();

    // eslint-disable-next-line consistent-this
    const that = this;

    let currentRuntimeProcess: child_process.ChildProcess | undefined;
    let controller: AbortController | undefined;
    let buildErrors: Error[] = [];
    let runtimeError: Error | undefined;

    let outputFile: string | undefined;
    let metafile: esbuild.Metafile | undefined;
    let env: Record<string, string> = await this.project.envManager.getValues();

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
        cwd: root,
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
            console.error(`Unknown message received "${msg.kind}"`);
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
              contents: await that.createMain(),
              resolveDir: root,
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

          that.project.events.emit('functionsBuildEnd', {});

          setInitialized();
        });
      },
    };

    const ctx = await esbuild.context({
      absWorkingDir: root,
      entryPoints: ['toolpad:main.ts'],
      plugins: [toolpadPlugin],
      write: true,
      bundle: true,
      metafile: true,
      outdir: path.resolve(that.project.getOutputFolder(), 'functions'),
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

    let resourcesWatcher: chokidar.FSWatcher | undefined;

    const unsubscribers: (() => void)[] = [];

    return {
      watch() {
        ctx.watch();

        const unsubscribeEnv = that.project.events.subscribe('envChanged', async () => {
          env = await that.project.envManager.getValues();
          restartRuntimeProcess();
        });

        unsubscribers.push(unsubscribeEnv);

        // Make sure we pick up added/removed function files
        (async () => {
          try {
            if (resourcesWatcher) {
              await resourcesWatcher.close();
            }
            const pattern = that.getFunctionResourcesPattern();

            const calculateFingerPrint = async () => {
              const functionFiles = await glob(pattern);
              return functionFiles.join('|');
            };

            let fingerprint = await calculateFingerPrint();

            const globalResourcesFolder = path.resolve(pattern);
            resourcesWatcher = chokidar.watch([globalResourcesFolder]);
            resourcesWatcher.on('all', async () => {
              const newFingerprint = await calculateFingerPrint();
              if (fingerprint !== newFingerprint) {
                fingerprint = newFingerprint;
                ctx.rebuild();
              }
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
        unsubscribers.forEach((unsubscribe) => unsubscribe());
        await Promise.all([ctx.dispose(), controller?.abort()]);
      },
    };
  }

  async startDev() {
    await this.migrateLegacy();
    const builder = await this.createBuilder();
    await builder.watch();
    return builder;
  }

  async exec(name: string, params: Record<string, unknown>) {
    try {
      const builder = await this.builder;
      const data = await builder.execute(name, params);
      return { data };
    } catch (rawError) {
      return { error: serializeError(errorFrom(rawError)) };
    }
  }

  async introspect() {
    const builder = await this.builder;
    const introspectionResult = await builder.introspect();
    return introspectionResult;
  }

  async initQueriesFile(): Promise<void> {
    const queriesFilePath = this.getFunctionsFile();
    if (!(await fileExists(queriesFilePath))) {
      // eslint-disable-next-line no-console
      console.log(`${chalk.blue('info')}  - Initializing Toolpad functions file`);
      await writeFileRecursive(queriesFilePath, DEFAULT_FUNCTIONS_FILE_CONTENT, {
        encoding: 'utf-8',
      });
    }
  }

  async openQueryEditor() {
    await this.initQueriesFile();
    const queriesFilePath = this.getFunctionsFile();
    await this.project.openCodeEditor(queriesFilePath);
  }
}
