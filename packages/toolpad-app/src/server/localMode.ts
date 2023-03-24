import * as yaml from 'yaml';
import * as path from 'path';
import * as fs from 'fs/promises';
import invariant from 'invariant';
import { Dirent } from 'fs';
import * as chokidar from 'chokidar';
import { debounce } from 'lodash';
import Emitter from '@mui/toolpad-core/utils/Emitter';
import openEditor from 'open-editor';
import chalk from 'chalk';
import config from '../config';
import * as appDom from '../appDom';
import { errorFrom } from '../utils/errors';
import { migrateUp } from '../appDom/migrations';
import insecureHash from '../utils/insecureHash';

export function getUserProjectRoot(): string {
  const { projectDir } = config;
  invariant(projectDir, 'Toolpad in local mode must have a project directory defined');
  return projectDir;
}

export async function fileExists(filepath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filepath);
    return stat.isFile();
  } catch (err) {
    if (errorFrom(err).code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}

export async function getConfigFilePath() {
  const yamlFilePath = path.resolve(getUserProjectRoot(), './toolpad.yaml');
  const ymlFilePath = path.resolve(getUserProjectRoot(), './toolpad.yml');

  if (await fileExists(yamlFilePath)) {
    return yamlFilePath;
  }

  if (await fileExists(ymlFilePath)) {
    return ymlFilePath;
  }

  return yamlFilePath;
}

type ComponentsContent = Record<string, string>;

export const QUERIES_FILE = `./toolpad/queries.ts`;

function getQueriesFilePath(): string {
  return path.resolve(getUserProjectRoot(), QUERIES_FILE);
}

function getComponentFolder(): string {
  return path.resolve(getUserProjectRoot(), './toolpad/components');
}

function getComponentFilePath(componentsFolder: string, componentName: string): string {
  return path.resolve(componentsFolder, `${componentName}.tsx`);
}

async function loadCodeComponentsFromFiles(): Promise<ComponentsContent> {
  const componentsFolder = getComponentFolder();
  await fs.mkdir(componentsFolder, { recursive: true });
  let entries: Dirent[] = [];
  try {
    entries = await fs.readdir(componentsFolder, { withFileTypes: true });
  } catch (err: unknown) {
    if (errorFrom(err).code !== 'ENOENT') {
      throw err;
    }
  }
  const resultEntries = await Promise.all(
    entries.map(async (entry): Promise<[string, string] | null> => {
      if (entry.isFile()) {
        const fileName = entry.name;
        const componentName = entry.name.replace(/\.tsx$/, '');
        const filePath = path.resolve(componentsFolder, fileName);
        const content = await fs.readFile(filePath, { encoding: 'utf-8' });
        return [componentName, content];
      }

      return null;
    }),
  );

  return Object.fromEntries(resultEntries.filter(Boolean));
}

class Lock {
  pending: Promise<any> | null = null;

  async use<T = void>(doWork: () => Promise<T>): Promise<T> {
    try {
      this.pending = Promise.resolve(this.pending).then(() => doWork());
      return await this.pending;
    } finally {
      this.pending = null;
    }
  }
}

const configFileLock = new Lock();

async function writeConfigFile(filePath: string, dom: appDom.AppDom): Promise<void> {
  await configFileLock.use(() =>
    fs.writeFile(filePath, yaml.stringify(dom), { encoding: 'utf-8' }),
  );
}

const DEFAULT_QUERIES_FILE_CONTENT = `// Toolpad queries:

export async function example() {
  return [
    { firstname: 'Nell', lastName: 'Lester' },
    { firstname: 'Keanu', lastName: 'Walter' },
    { firstname: 'Daniella', lastName: 'Sweeney' },
  ];
}
`;

async function initQueriesFile(): Promise<void> {
  const queriesFilePath = getQueriesFilePath();
  if (!(await fileExists(queriesFilePath))) {
    // eslint-disable-next-line no-console
    console.log(`${chalk.blue('info')} - Initializing Toolpad queries file`);
    await fs.writeFile(queriesFilePath, DEFAULT_QUERIES_FILE_CONTENT, { encoding: 'utf-8' });
  }
}

async function initToolpadFile(): Promise<void> {
  const configFilePath = await getConfigFilePath();
  if (!(await fileExists(configFilePath))) {
    // eslint-disable-next-line no-console
    console.log(`${chalk.blue('info')} - Initializing Toolpad config file`);
    const defaultDom = appDom.createDefaultDom();
    await writeConfigFile(configFilePath, defaultDom);
  }
}

async function initProjectFolder(): Promise<void> {
  await Promise.all([initToolpadFile(), initQueriesFile()]);
}

// eslint-disable-next-line no-underscore-dangle
(globalThis as any).__init_project__ ??= initProjectFolder();
// eslint-disable-next-line no-underscore-dangle
const initPromise = (globalThis as any).__init_project__;

async function writeCodeComponentsToFiles(
  componentsFolder: string,
  components: ComponentsContent,
): Promise<void> {
  await fs.mkdir(componentsFolder, { recursive: true });
  await Promise.all(
    Object.entries(components).map(async ([componentName, content]) => {
      const filePath = getComponentFilePath(componentsFolder, componentName);
      await fs.writeFile(filePath, content, { encoding: 'utf-8' });
    }),
  );
}

function mergeComponentsContentIntoDom(
  dom: appDom.AppDom,
  componentsContent: ComponentsContent,
): appDom.AppDom {
  const rootNode = appDom.getApp(dom);
  const { codeComponents: codeComponentNodes = [] } = appDom.getChildNodes(dom, rootNode);
  const names = new Set([
    ...Object.keys(componentsContent),
    ...codeComponentNodes.map((node) => node.name),
  ]);

  for (const name of names) {
    const content: string | undefined = componentsContent[name];
    const codeComponentNode = codeComponentNodes.find((node) => node.name === name);
    if (content) {
      if (codeComponentNode) {
        dom = appDom.setNodeNamespacedProp(
          dom,
          codeComponentNode,
          'attributes',
          'code',
          appDom.createConst(content),
        );
      } else {
        const newNode = appDom.createNode(dom, 'codeComponent', {
          name,
          attributes: {
            code: appDom.createConst(content),
          },
        });
        dom = appDom.addNode(dom, newNode, rootNode, 'codeComponents');
      }
    } else if (codeComponentNode) {
      dom = appDom.removeNode(dom, codeComponentNode.id);
    }
  }

  return dom;
}

interface ExtractedComponents {
  components: ComponentsContent;
  dom: appDom.AppDom;
}

function extractNewComponentsContentFromDom(dom: appDom.AppDom): ExtractedComponents {
  const rootNode = appDom.getApp(dom);
  const { codeComponents: codeComponentNodes = [] } = appDom.getChildNodes(dom, rootNode);

  const components: ComponentsContent = {};

  for (const codeComponent of codeComponentNodes) {
    if (codeComponent.attributes.isNew?.value) {
      components[codeComponent.name] = codeComponent.attributes.code.value;
    }
    dom = appDom.removeNode(dom, codeComponent.id);
  }

  return { components, dom };
}

export async function writeDomToDisk(dom: appDom.AppDom): Promise<void> {
  const configFilePath = await getConfigFilePath();
  const componentsFolder = getComponentFolder();

  const { components: componentsContent, dom: domWithoutComponents } =
    extractNewComponentsContentFromDom(dom);
  await Promise.all([
    writeConfigFile(configFilePath, domWithoutComponents),
    writeCodeComponentsToFiles(componentsFolder, componentsContent),
  ]);
}

export async function saveLocalDom(dom: appDom.AppDom): Promise<void> {
  if (config.cmd !== 'dev') {
    throw new Error(`Writing to disk is only possible in toolpad dev mode.`);
  }

  await writeDomToDisk(dom);
}

async function loadConfigFileFrom(configFilePath: string): Promise<appDom.AppDom | null> {
  await initPromise;
  try {
    // Using a lock to avoid read during write which may result in reading truncated file content
    const configContent = await configFileLock.use(() =>
      fs.readFile(configFilePath, { encoding: 'utf-8' }),
    );
    const parsedConfig = yaml.parse(configContent);
    invariant(parsedConfig, 'Invalid Toolpad config');
    return parsedConfig;
  } catch (rawError) {
    const error = errorFrom(rawError);
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function loadConfigFile() {
  const configFilePath = await getConfigFilePath();
  const dom = await loadConfigFileFrom(configFilePath);

  if (dom) {
    return dom;
  }

  throw new Error(`No toolpad dom found`);
}

export async function loadDomFromDisk(): Promise<appDom.AppDom> {
  await initPromise;
  const [configContent, componentsContent] = await Promise.all([
    loadConfigFile(),
    loadCodeComponentsFromFiles(),
  ]);
  const dom = mergeComponentsContentIntoDom(configContent, componentsContent);
  return dom;
}

export async function loadLocalDom(): Promise<appDom.AppDom> {
  const dom = await loadDomFromDisk();
  return migrateUp(dom);
}

export async function openCodeEditor(file: string): Promise<void> {
  const userProjectRoot = getUserProjectRoot();
  const fullPath = path.resolve(userProjectRoot, file);
  openEditor([fullPath, userProjectRoot], {
    editor: process.env.EDITOR ? undefined : 'vscode',
  });
}

export async function openCodeComponentEditor(componentName: string): Promise<void> {
  const componentsFolder = getComponentFolder();
  const fullPath = getComponentFilePath(componentsFolder, componentName);
  const userProjectRoot = getUserProjectRoot();
  openEditor([fullPath, userProjectRoot], {
    editor: process.env.EDITOR ? undefined : 'vscode',
  });
}

async function getQueriesFileContent(): Promise<string | null> {
  await initPromise;
  try {
    return await fs.readFile(getQueriesFilePath(), { encoding: 'utf-8' });
  } catch (err) {
    if (errorFrom(err).code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

export async function getDomFingerprint() {
  const [configContent, componentsContent, queriesFile] = await Promise.all([
    loadConfigFile(),
    loadCodeComponentsFromFiles(),
    getQueriesFileContent(),
  ]);

  return insecureHash(JSON.stringify([configContent, componentsContent, queriesFile]));
}

export type ProjectFolderEntry = {
  name: string;
  kind: 'query';
  filepath: string;
};

export async function readProjectFolder(): Promise<ProjectFolderEntry[]> {
  const userProjectRoot = getUserProjectRoot();
  const toolpadFolder = path.resolve(userProjectRoot, 'toolpad');
  const entries = await fs.readdir(toolpadFolder, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const match = /^(.*)\.query\.[jt]sx?$/.exec(entry.name);
    if (entry.isFile() && match) {
      const name = match[1];
      return [
        {
          name,
          kind: 'query',
          filepath: path.resolve(toolpadFolder, entry.name),
        },
      ];
    }
    return [];
  });
}

export interface QueryFile {
  name: string;
  kind: 'query';
  filepath: string;
  hash: string;
  content: string;
}

export interface QueriesFile {
  name: string;
  kind: 'queries';
  filepath: string;
  hash: string;
  content: string;
}

export interface DomFile {
  name: string;
  kind: 'dom';
  filepath: string;
  hash: string;
  content: appDom.AppDom;
}

export interface PageFile {
  name: string;
  kind: 'page';
  filepath: string;
  hash: string;
  content: string;
}

export interface ComponentFile {
  name: string;
  kind: 'component';
  filepath: string;
  hash: string;
  content: string;
}

export type ToolpadFile = QueryFile | QueriesFile | PageFile | ComponentFile;

export interface ToolpadProjectFiles {
  /** @depcrecated We will phase out a single dom file for multiple individual files in the toolpad folder */
  dom: DomFile | null;
  /** @depcrecated We will phase out a single queries file for multiple individual query files in the toolpad folder */
  queries: QueriesFile | null;
  files: ToolpadFile[];
}

function getToolpadFolder(root: string): string {
  return path.resolve(root, './toolpad');
}

function getComponentsFolder(root: string): string {
  return path.resolve(getToolpadFolder(root), './components');
}

function getQueriesFile(root: string): string {
  return path.resolve(getToolpadFolder(root), './queries.ts');
}

function getDomFile(root: string): string {
  return path.resolve(getToolpadFolder(root), './toolpad.yml');
}

async function readDomFile(root: string): Promise<DomFile | null> {
  const filepath = getDomFile(root);
  try {
    const configContent = await fs.readFile(filepath, { encoding: 'utf-8' });
    const parsedConfig = yaml.parse(configContent);
    return {
      name: 'dom',
      kind: 'dom',
      filepath,
      hash: String(insecureHash(configContent)),
      content: parsedConfig,
    };
  } catch (rawError) {
    const error = errorFrom(rawError);
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function readQueriesFile(root: string): Promise<QueriesFile | null> {
  const filepath = getQueriesFile(root);
  try {
    const content = await fs.readFile(filepath, { encoding: 'utf-8' });
    return {
      name: 'queries',
      kind: 'queries',
      filepath,
      hash: String(insecureHash(content)),
      content,
    };
  } catch (rawError) {
    const error = errorFrom(rawError);
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function readComponentsFolder(root: string) {
  const componentsFolder = getComponentsFolder(root);
  const entries = await fs.readdir(componentsFolder, { withFileTypes: true });
  const filePromises: Promise<ComponentFile | null>[] = entries.map(async (entry) => {
    if (entry.isFile()) {
      const filepath = path.resolve(componentsFolder, entry.name);

      const content = await fs.readFile(filepath, { encoding: 'utf-8' });

      return {
        name: entry.name.replace(/\.[^.]+$/, ''),
        kind: 'component',
        filepath,
        hash: String(insecureHash(content)),
        content,
      } satisfies ToolpadFile;
    }

    return null;
  });

  const maybeFiles = await Promise.all(filePromises);

  return maybeFiles.filter(Boolean);
}

async function readProjectFiles(root: string): Promise<ToolpadFile[]> {
  const toolpadFolder = getToolpadFolder(root);
  await fs.mkdir(toolpadFolder, { recursive: true });
  const entries = await fs.readdir(toolpadFolder, { withFileTypes: true });
  const filePromises: Promise<ToolpadFile | null>[] = entries.map(async (entry) => {
    const match =
      /^(?<name>.*)\.(?<kind>query|page|component)\.(?<extension>js|jsx|ts|tsx|yml)$/.exec(
        entry.name,
      );

    const filepath = path.resolve(toolpadFolder, entry.name);
    if (entry.isFile() && match?.groups) {
      const { name, kind } = match.groups;

      const content = await fs.readFile(filepath, { encoding: 'utf-8' });

      invariant(
        kind === 'query' || kind === 'page' || kind === 'component',
        `Invalid file kind detected "${kind}"`,
      );

      return {
        name,
        kind,
        filepath,
        hash: String(insecureHash(content)),
        content,
      } satisfies ToolpadFile;
    }

    return null;
  });

  const maybeFiles = await Promise.all(filePromises);

  return maybeFiles.filter(Boolean);
}

export async function readToolpadProjectFiles(root: string): Promise<ToolpadProjectFiles> {
  const [dom, queries, files, components] = await Promise.all([
    readDomFile(root),
    readQueriesFile(root),
    readProjectFiles(root),
    readComponentsFolder(root),
  ]);

  return { dom, queries, files: [...files, ...components] };
}

type ToolpadProjectEvents = {
  change: {};
};

export class ToolpadProject {
  private root: string;

  private watcher: chokidar.FSWatcher | undefined;

  private files: Promise<ToolpadProjectFiles> | undefined;

  private emitter = new Emitter<ToolpadProjectEvents>();

  constructor(root: string) {
    this.root = root;
  }

  on(...args: Parameters<typeof this.emitter.on>) {
    return this.emitter.on(...args);
  }

  off(...args: Parameters<typeof this.emitter.off>) {
    return this.emitter.off(...args);
  }

  watch() {
    if (!this.watcher) {
      const handleProjectFileChanged = debounce(async () => {
        this.files = readToolpadProjectFiles(this.root);
        await this.files;
        this.emitter.emit('change', {});
      }, 200);

      this.watcher = chokidar
        .watch([getToolpadFolder(this.root), getDomFile(this.root)])
        .on('all', handleProjectFileChanged);
    }
  }

  async getFiles(): Promise<ToolpadProjectFiles> {
    if (!this.files) {
      this.files = readToolpadProjectFiles(this.root);
    }
    return this.files;
  }
}

/*
// WIP

(globalThis as any).toolpadProject = (globalThis as any).toolpadProject || (() => {
  const project = new ToolpadProject(getUserProjectRoot())

  if (config.cmd === 'dev') {
    project.watch()
  }

  return project
})()
*/
