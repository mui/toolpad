import { Emitter } from '@mui/toolpad-utils/events';
import * as esbuild from 'esbuild';
import * as path from 'path';
import { ensureSuffix, indent } from '@mui/toolpad-utils/strings';
import * as chokidar from 'chokidar';
import chalk from 'chalk';
import { glob } from 'glob';
import * as fs from 'fs/promises';
import { writeFileRecursive, fileExists } from '@mui/toolpad-utils/fs';
import invariant from 'invariant';
import Piscina from 'piscina';
import { ExecFetchResult } from '@mui/toolpad-core';
import { errorFrom } from '@mui/toolpad-utils/errors';
import EnvManager from './EnvManager';
import { ProjectEvents, ToolpadProjectOptions } from '../types';
import { createWorker as createDevWorker } from './functionsDevWorker';
import {
  tsConfig,
  type ExtractTypesParams,
  type IntrospectionResult,
} from './functionsTypesWorker';
import { Awaitable } from '../utils/types';
import { format } from '../utils/prettier';

function createDefaultFunction(): string {
  return format(`
    /**
     * Toolpad handlers file.
     */

    export default async function handler (message: string) {
      return \`Hello \${message}\`;
    }
  `);
}

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
  invalidateQueries(): void;
}

export default class FunctionsManager {
  private project: IToolpadProject;

  private buildMetafile: esbuild.Metafile | undefined;

  private buildErrors: esbuild.Message[] = [];

  private devWorker: ReturnType<typeof createDevWorker>;

  private initPromise: Promise<void>;

  private extractedTypes: Awaitable<IntrospectionResult> | undefined;

  private extractTypesWorker: Piscina;

  // eslint-disable-next-line class-methods-use-this
  private setInitialized: () => void = () => {
    throw new Error('setInitialized should be initialized');
  };

  constructor(project: IToolpadProject) {
    this.project = project;
    this.initPromise = new Promise((resolve) => {
      this.setInitialized = resolve;
    });
    this.devWorker = createDevWorker(process.env);
    this.extractTypesWorker = new Piscina({
      filename: path.join(__dirname, 'functionsTypesWorker.js'),
    });
    this.startDev();
  }

  private getResourcesFolder(): string {
    return path.join(this.project.getToolpadFolder(), './resources');
  }

  private getFunctionsFile(): string {
    return path.join(this.getResourcesFolder(), './functions.ts');
  }

  private getFunctionResourcesPattern(): string {
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

  private async getFunctionFiles(): Promise<string[]> {
    const paths = await glob(this.getFunctionResourcesPattern());
    return paths.map((fullPath) => path.relative(this.project.getRoot(), fullPath));
  }

  private getBuildErrorsForFile(entryPoint: string) {
    return this.buildErrors.filter((error) => error.location?.file === entryPoint);
  }

  private getOutputFileForEntryPoint(entryPoint: string): string | undefined {
    const [outputFile] =
      Object.entries(this.buildMetafile?.outputs ?? {}).find(
        (entry) => entry[1].entryPoint === entryPoint,
      ) ?? [];

    return outputFile;
  }

  private async extractTypes() {
    this.extractedTypes = this.extractTypesWorker
      .run({ resourcesFolder: this.getResourcesFolder() } satisfies ExtractTypesParams, {})
      .catch((error) => ({
        error,
        files: [],
      }));
    return this.extractedTypes;
  }

  private async createEsbuildContext() {
    const root = this.project.getRoot();

    const onFunctionBuildStart = async () => {
      await this.extractTypes();
    };

    const onFunctionsBuildEnd = async (args: esbuild.BuildResult<esbuild.BuildOptions>) => {
      // TODO: use for hot reloading
      // eslint-disable-next-line no-console
      console.log(
        `${chalk.green('ready')} - built functions.ts: ${args.errors.length} error(s), ${
          args.warnings.length
        } warning(s)`,
      );

      invariant(
        this.extractedTypes,
        'this.extractedTypes should have been initialized during build.onStart',
      );

      await this.extractedTypes;

      this.buildErrors = args.errors;

      this.buildMetafile = args.metafile;

      this.project.invalidateQueries();

      this.setInitialized();
    };

    const toolpadPlugin: esbuild.Plugin = {
      name: 'toolpad',
      setup(build) {
        build.onStart(onFunctionBuildStart);
        build.onEnd(onFunctionsBuildEnd);
      },
    };

    const entryPoints = await this.getFunctionFiles();
    return esbuild.context({
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
      tsconfigRaw: JSON.stringify(tsConfig),
      loader: {
        '.txt': 'text',
        '.sql': 'text',
      },
    });
  }

  private async startWatchingFunctionFiles() {
    let ctx: esbuild.BuildContext | undefined;

    // Make sure we pick up added/removed function files
    const resourcesWatcher = chokidar.watch([this.getFunctionResourcesPattern()], {
      ignoreInitial: true,
    });

    const reinitializeWatcher = async () => {
      await ctx?.dispose();
      ctx = await this.createEsbuildContext();
      await ctx.watch();
    };

    reinitializeWatcher();
    resourcesWatcher.on('add', reinitializeWatcher);
    resourcesWatcher.on('unlink', reinitializeWatcher);
  }

  private async createRuntimeWorkerWithEnv() {
    const oldWorker = this.devWorker;
    this.devWorker = createDevWorker(process.env);

    await oldWorker.terminate();

    this.project.invalidateQueries();
  }

  async startDev() {
    await this.migrateLegacy();

    await this.startWatchingFunctionFiles();

    await this.createRuntimeWorkerWithEnv();
    this.project.events.subscribe('envChanged', async () => {
      await this.createRuntimeWorkerWithEnv();
    });
  }

  async build() {
    const ctx = await this.createEsbuildContext();
    await ctx.rebuild();
  }

  async startProd() {
    await this.createRuntimeWorkerWithEnv();
  }

  async exec(
    fileName: string,
    name: string,
    parameters: Record<string, unknown>,
  ): Promise<ExecFetchResult<unknown>> {
    await this.initPromise;

    invariant(
      this.extractedTypes,
      'this.extractedTypes should have been initialized during build.onStart',
    );

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

    const extractedTypes = await this.extractedTypes;

    if (extractedTypes.error) {
      throw errorFrom(extractedTypes.error);
    }

    const file = extractedTypes.files.find((fileEntry) => fileEntry.name === fileName);
    const handler = file?.handlers.find((handlerEntry) => handlerEntry.name === name);

    if (!handler) {
      throw new Error(`No function found with the name "${name}"`);
    }

    const executeParams = handler.isCreateFunction
      ? [{ parameters }]
      : handler.parameters.map(([parameterName]) => parameters[parameterName]);

    const data = await this.devWorker.execute(outputFilePath, name, executeParams);

    return { data };
  }

  async introspect(): Promise<IntrospectionResult> {
    await this.initPromise;

    invariant(
      this.extractedTypes,
      'this.extractedTypes should have been initialized before initPromise resolves',
    );

    return this.extractedTypes;
  }

  async openQueryEditor(fileName: string) {
    const queriesFilePath = path.resolve(this.getResourcesFolder(), fileName);
    await this.project.openCodeEditor(queriesFilePath);
  }

  async createFunctionFile(name: string): Promise<void> {
    const filePath = path.resolve(this.getResourcesFolder(), ensureSuffix(name, '.ts'));
    const content = createDefaultFunction();
    if (await fileExists(filePath)) {
      throw new Error(`"${name}" already exists`);
    }
    await writeFileRecursive(filePath, content, { encoding: 'utf-8' });
    await this.extractTypes();
  }
}
