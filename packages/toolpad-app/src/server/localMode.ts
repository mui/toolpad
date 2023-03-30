import * as yaml from 'yaml';
import * as path from 'path';
import * as fs from 'fs/promises';
import invariant from 'invariant';
import { Dirent } from 'fs';
import openEditor from 'open-editor';
import chalk from 'chalk';
import config from '../config';
import * as appDom from '../appDom';
import { errorFrom } from '../utils/errors';
import { migrateUp, isUpToDate } from './migrations';
import insecureHash from '../utils/insecureHash';
import { writeFileRecursive, readMaybeFile } from '../utils/fs';
import { format } from '../utils/prettier';

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

function getToolpadFolder(root: string): string {
  return path.resolve(root, './toolpad');
}

function getQueriesFile(root: string): string {
  return path.resolve(getToolpadFolder(root), './queries.ts');
}

function getComponentsFolder(root: string): string {
  const toolpadFolder = getToolpadFolder(root);
  return path.resolve(toolpadFolder, './components');
}

function getComponentFilePath(componentsFolder: string, componentName: string): string {
  return path.resolve(componentsFolder, `${componentName}.tsx`);
}

export async function getConfigFilePath(root: string) {
  const yamlFilePath = path.resolve(root, './toolpad.yaml');
  const ymlFilePath = path.resolve(root, './toolpad.yml');

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

async function loadCodeComponentsFromFiles(root: string): Promise<ComponentsContent> {
  const componentsFolder = getComponentsFolder(root);
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

function createDefaultCodeComponent(name: string): string {
  const componentId = name.replace(/\s/g, '');
  const propTypeId = `${componentId}Props`;
  return format(`
    import * as React from 'react';
    import { Typography } from '@mui/material';
    import { createComponent } from '@mui/toolpad/browser';
    
    export interface ${propTypeId} {
      msg: string;
    }
    
    function ${componentId}({ msg }: ${propTypeId}) {
      return (
        <Typography>{msg}</Typography>
      );
    }

    export default createComponent(${componentId}, {
      argTypes: {
        msg: {
          typeDef: { type: "string", default: "Hello world!" },
        },
      },
    });    
  `);
}

export async function createComponent(name: string) {
  const root = getUserProjectRoot();
  const componentsFolder = getComponentsFolder(root);
  const filePath = getComponentFilePath(componentsFolder, name);
  const content = createDefaultCodeComponent(name);
  await writeFileRecursive(filePath, content, { encoding: 'utf-8' });
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

async function loadConfigFileFrom(configFilePath: string): Promise<appDom.AppDom | null> {
  // Using a lock to avoid read during write which may result in reading truncated file content
  const configContent = await configFileLock.use(() => readMaybeFile(configFilePath));

  if (!configContent) {
    return null;
  }

  const parsedConfig = yaml.parse(configContent);
  invariant(parsedConfig, 'Invalid Toolpad config');
  return parsedConfig;
}

async function loadConfigFile(root: string) {
  const configFilePath = await getConfigFilePath(root);
  const dom = await loadConfigFileFrom(configFilePath);

  if (dom) {
    return dom;
  }

  throw new Error(`No toolpad dom found`);
}

async function writeConfigFile(root: string, dom: appDom.AppDom): Promise<void> {
  const configFilePath = await getConfigFilePath(root);
  await configFileLock.use(() =>
    writeFileRecursive(configFilePath, yaml.stringify(dom), { encoding: 'utf-8' }),
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

async function initToolpadFolder(root: string) {
  const toolpadFolder = getToolpadFolder(root);
  await fs.mkdir(toolpadFolder, { recursive: true });
}

async function initQueriesFile(root: string): Promise<void> {
  const queriesFilePath = getQueriesFile(root);
  if (!(await fileExists(queriesFilePath))) {
    // eslint-disable-next-line no-console
    console.log(`${chalk.blue('info')}  - Initializing Toolpad queries file`);
    await writeFileRecursive(queriesFilePath, DEFAULT_QUERIES_FILE_CONTENT, { encoding: 'utf-8' });
  }
}

async function initToolpadFile(root: string): Promise<void> {
  const configFilePath = await getConfigFilePath(root);
  if (!(await fileExists(configFilePath))) {
    // eslint-disable-next-line no-console
    console.log(`${chalk.blue('info')}  - Initializing Toolpad config file`);
    const defaultDom = appDom.createDefaultDom();
    await writeConfigFile(root, defaultDom);
  }
}

const DEFAULT_GENERATED_GITIGNORE_FILE_CONTENT = `*
!.gitignore
`;

async function initGeneratedGitignore(root: string) {
  const generatedFolder = path.resolve(root, '.toolpad-generated');
  const generatedGitignorePath = path.resolve(generatedFolder, '.gitignore');
  if (!(await fileExists(generatedGitignorePath))) {
    // eslint-disable-next-line no-console
    console.log(`${chalk.blue('info')}  - Initializing Toolpad queries file`);
    await writeFileRecursive(generatedGitignorePath, DEFAULT_GENERATED_GITIGNORE_FILE_CONTENT, {
      encoding: 'utf-8',
    });
  }
}

async function migrateProject(root: string) {
  let dom = await loadConfigFile(root);
  const domVersion = dom.version ?? 0;
  if (domVersion > appDom.CURRENT_APPDOM_VERSION) {
    console.error(
      `${chalk.red(
        'error',
      )} - This project was created with a newer version of Toolpad, please upgrade your ${chalk.cyan(
        '@mui/toolpad',
      )} installation`,
    );
  } else if (domVersion < appDom.CURRENT_APPDOM_VERSION) {
    // eslint-disable-next-line no-console
    console.log(
      `${chalk.blue(
        'info',
      )}  - This project was created by an older version of Toolpad. Upgrading...`,
    );
    dom = migrateUp(dom);
    await writeConfigFile(root, dom);
  }
}

async function initProjectFolder(): Promise<void> {
  try {
    const root = getUserProjectRoot();
    if (config.cmd === 'dev') {
      await initToolpadFolder(root);
      await Promise.all([initGeneratedGitignore(root), initToolpadFile(root)]);
      await migrateProject(root);
    } else {
      // TODO: verify files exist?
    }
  } catch (err) {
    console.error(`${chalk.red('error')} - Failed to intialize Toolpad`);
    console.error(err);
    process.exit(1);
  }
}

// eslint-disable-next-line no-underscore-dangle
(globalThis as any).__init_project__ ??= initProjectFolder();
// eslint-disable-next-line no-underscore-dangle
export const isInitialized = (globalThis as any).__init_project__;

async function writeCodeComponentsToFiles(
  componentsFolder: string,
  components: ComponentsContent,
): Promise<void> {
  await Promise.all(
    Object.entries(components).map(async ([componentName, content]) => {
      const filePath = getComponentFilePath(componentsFolder, componentName);
      await writeFileRecursive(filePath, content, { encoding: 'utf-8' });
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

async function writeDomToDisk(dom: appDom.AppDom): Promise<void> {
  const root = getUserProjectRoot();
  const componentsFolder = getComponentsFolder(root);

  const { components: componentsContent, dom: domWithoutComponents } =
    extractNewComponentsContentFromDom(dom);
  await Promise.all([
    writeConfigFile(root, domWithoutComponents),
    writeCodeComponentsToFiles(componentsFolder, componentsContent),
  ]);
}

export async function saveLocalDom(dom: appDom.AppDom): Promise<void> {
  if (config.cmd !== 'dev') {
    throw new Error(`Writing to disk is only possible in toolpad dev mode.`);
  }

  await writeDomToDisk(dom);
}

async function loadDomFromDisk(): Promise<appDom.AppDom> {
  const root = getUserProjectRoot();
  const [configContent, componentsContent] = await Promise.all([
    loadConfigFile(root),
    loadCodeComponentsFromFiles(root),
  ]);
  const dom = mergeComponentsContentIntoDom(configContent, componentsContent);
  return dom;
}

export async function loadLocalDom(): Promise<appDom.AppDom> {
  await isInitialized;
  const dom = await loadDomFromDisk();
  if (!isUpToDate(dom)) {
    throw new Error(`Incompatible dom`);
  }
  return dom;
}

export async function openCodeEditor(file: string): Promise<void> {
  const userProjectRoot = getUserProjectRoot();
  const fullPath = path.resolve(userProjectRoot, file);
  openEditor([fullPath, userProjectRoot], {
    editor: process.env.EDITOR ? undefined : 'vscode',
  });
}

export async function openCodeComponentEditor(componentName: string): Promise<void> {
  const root = getUserProjectRoot();
  const componentsFolder = getComponentsFolder(root);
  const fullPath = getComponentFilePath(componentsFolder, componentName);
  const userProjectRoot = getUserProjectRoot();
  openEditor([fullPath, userProjectRoot], {
    editor: process.env.EDITOR ? undefined : 'vscode',
  });
}

export async function openQueryEditor() {
  const root = getUserProjectRoot();
  await initQueriesFile(root);
  const queriesFilePath = getQueriesFile(root);
  await openCodeEditor(queriesFilePath);
}

async function getQueriesFileContent(root: string): Promise<string | null> {
  return readMaybeFile(getQueriesFile(root));
}

export async function getDomFingerprint() {
  const root = getUserProjectRoot();
  const [configContent, componentsContent, queriesFile] = await Promise.all([
    loadConfigFile(root),
    loadCodeComponentsFromFiles(root),
    getQueriesFileContent(root),
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
