import { Emitter } from '@mui/toolpad-utils/events';
import * as esbuild from 'esbuild';
import * as path from 'path';
import { indent } from '@mui/toolpad-utils/strings';
import * as chokidar from 'chokidar';
import chalk from 'chalk';
import { glob } from 'glob';
import * as fs from 'fs/promises';
import EnvManager from './EnvManager';
import { ProjectEvents, ToolpadProjectOptions } from '../types';
import { writeFileRecursive, fileExists } from '../utils/fs';
import { createWorker } from './functionsDevWorker';

const DEFAULT_FUNCTIONS_FILE_CONTENT = `// Toolpad queries:

export async function example() {
  return [
    { firstname: 'Nell', lastName: 'Lester' },
    { firstname: 'Keanu', lastName: 'Walter' },
    { firstname: 'Daniella', lastName: 'Sweeney' },
  ];
}
`;

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

function formatError(esbuildError: esbuild.Message): Error {
  let messageText = esbuildError.text;
  if (esbuildError.location) {
    const formattedLocation = indent(formatCodeFrame(esbuildError.location), 2);
    messageText = [messageText, formattedLocation].join('\n');
  }
  return new Error(messageText);
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

  private buildMetafile: esbuild.Metafile | undefined;

  private buildErrors: esbuild.Message[] = [];

  private devWorker: ReturnType<typeof createWorker>;

  private initPromise: Promise<void>;

  // eslint-disable-next-line class-methods-use-this
  private setInitialized: () => void = () => {
    throw new Error('setInitialized should be initialized');
  };

  constructor(project: IToolpadProject) {
    this.project = project;
    this.initPromise = new Promise((resolve) => {
      this.setInitialized = resolve;
    });
    this.devWorker = createWorker({ ...process.env });
    this.startDev();
  }

  getResourcesFolder(): string {
    return path.join(this.project.getToolpadFolder(), './resources');
  }

  getFunctionsFile() {
    return path.join(this.getResourcesFolder(), './functions.ts');
  }

  getFunctionResourcesPattern(): string {
    return path.join(this.getResourcesFolder(), '*.ts');
  }

  private async migrateLegacy() {
    const legacyQueriesFile = path.resolve(this.project.getToolpadFolder(), 'queries.ts');
    if (await fileExists(legacyQueriesFile)) {
      const functionsFile = this.getFunctionsFile();
      await fs.mkdir(path.dirname(functionsFile), { recursive: true });
      await fs.rename(legacyQueriesFile, functionsFile);
    }
  }

  async getFunctionFiles(): Promise<string[]> {
    const paths = await glob(this.getFunctionResourcesPattern());
    return paths.map((fullPath) => path.relative(this.project.getRoot(), fullPath));
  }

  getBuildErrorsForFile(entryPoint: string) {
    return this.buildErrors.filter((error) => error.location?.file === entryPoint);
  }

  getOutputFileForEntryPoint(entryPoint: string): string | undefined {
    const [outputFile] =
      Object.entries(this.buildMetafile?.outputs ?? {}).find(
        (entry) => entry[1].entryPoint === entryPoint,
      ) ?? [];

    return outputFile;
  }

  async createBuilder() {
    const root = this.project.getRoot();

    const entryPoints = await this.getFunctionFiles();

    const onFunctionsBuildEnd = async (args: esbuild.BuildResult<esbuild.BuildOptions>) => {
      // TODO: use for hot reloading
      // eslint-disable-next-line no-console
      console.log(
        `${chalk.green('ready')} - built functions.ts: ${args.errors.length} error(s), ${
          args.warnings.length
        } warning(s)`,
      );

      this.buildErrors = args.errors;

      this.buildMetafile = args.metafile;

      this.project.events.emit('functionsBuildEnd', {});

      this.setInitialized();
    };

    const toolpadPlugin: esbuild.Plugin = {
      name: 'toolpad',
      setup(build) {
        build.onEnd((args) => {
          onFunctionsBuildEnd(args);
        });
      },
    };

    const ctx = await esbuild.context({
      absWorkingDir: root,
      entryPoints,
      plugins: [toolpadPlugin],
      write: true,
      bundle: true,
      metafile: true,
      outdir: path.resolve(this.project.getOutputFolder(), 'functions'),
      platform: 'node',
      packages: 'external',
      target: 'es2022',
    });

    const watch = () => {
      ctx.watch({});

      // Make sure we pick up added/removed function files
      const resourcesWatcher = chokidar.watch([this.getFunctionResourcesPattern()]);
      const handleFileAddedOrRemoved = async () => {
        await ctx.rebuild().catch(() => {});
      };
      resourcesWatcher.on('add', handleFileAddedOrRemoved);
      resourcesWatcher.on('unlink', handleFileAddedOrRemoved);
    };

    return {
      watch,
    };
  }

  async createRuntimeWorkerWithEnv() {
    const env = await this.project.envManager.getValues();
    this.devWorker = createWorker({ ...process.env, ...env });
  }

  async startDev() {
    await this.migrateLegacy();

    await this.createRuntimeWorkerWithEnv();

    const builder = await this.createBuilder();
    await builder.watch();

    this.project.events.subscribe('envChanged', async () => {
      await this.createRuntimeWorkerWithEnv();
    });
  }

  async exec(fileName: string, name: string, parameters: Record<string, unknown>) {
    await this.initPromise;
    const resourcesFolder = this.getResourcesFolder();
    const fullPath = path.resolve(resourcesFolder, fileName);
    const entryPoint = path.relative(this.project.getRoot(), fullPath);

    const buildErrors = this.getBuildErrorsForFile(entryPoint);

    if (buildErrors.length > 0) {
      throw formatError(buildErrors[0]);
    }

    const outputFilePath = this.getOutputFileForEntryPoint(entryPoint);
    if (!outputFilePath) {
      throw new Error(`No build found for "${fileName}"`);
    }

    return this.devWorker.execute(outputFilePath, name, parameters);
  }

  async introspect() {
    await this.initPromise;
    const functionFiles = await this.getFunctionFiles();
    const outputFiles = new Map(
      functionFiles.flatMap((functionFile) => {
        const file = this.getOutputFileForEntryPoint(functionFile);
        return file ? [[functionFile, { file }]] : [];
      }),
    );
    return this.devWorker.introspect(outputFiles);
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
