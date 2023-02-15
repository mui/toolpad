import * as yaml from 'yaml';
import * as path from 'path';
import * as fs from 'fs/promises';
import invariant from 'invariant';
import * as child_process from 'child_process';
import { promisify } from 'util';
import { Dirent } from 'fs';
import config from '../config';
import * as appDom from '../appDom';
import { errorFrom } from '../utils/errors';
import insecureHash from '../utils/insecureHash';
import { migrateUp } from '../appDom/migrations';

const execFile = promisify(child_process.execFile);

export function getUserProjectRoot(): string {
  const { projectDir } = config;
  invariant(projectDir, 'Toolpad in local mode must have a project directory defined');
  return projectDir;
}

export function getConfigFilePath() {
  const filePath = path.resolve(getUserProjectRoot(), './toolpad.yaml');
  return filePath;
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

async function writeConfigFile(filePath: string, dom: appDom.AppDom): Promise<void> {
  await fs.writeFile(filePath, yaml.stringify(dom), { encoding: 'utf-8' });
}

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

function extractComponentsContentFromDom(dom: appDom.AppDom): ExtractedComponents {
  const rootNode = appDom.getApp(dom);
  const { codeComponents: codeComponentNodes = [] } = appDom.getChildNodes(dom, rootNode);

  const components: ComponentsContent = {};

  for (const codeComponent of codeComponentNodes) {
    components[codeComponent.name] = codeComponent.attributes.code.value;
    dom = appDom.removeNode(dom, codeComponent.id);
  }

  return { components, dom };
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

const DEFAULT_QUERIES_FILE_CONTENT = `// Toolpad queries:

export async function example() {
  return [
    { firstname: 'Nell', lastName: 'Lester' },
    { firstname: 'Keanu', lastName: 'Walter' },
    { firstname: 'Daniella', lastName: 'Sweeney' },
  ];
}
`;

export async function writeQueriesFile(): Promise<void> {
  const queriesFilePath = getQueriesFilePath();
  if (!(await fileExists(queriesFilePath))) {
    await fs.writeFile(queriesFilePath, DEFAULT_QUERIES_FILE_CONTENT, { encoding: 'utf-8' });
  }
}

export async function writeDomToDisk(dom: appDom.AppDom): Promise<void> {
  const configFilePath = getConfigFilePath();
  const componentsFolder = getComponentFolder();

  const { components: componentsContent, dom: domWithoutComponents } =
    extractComponentsContentFromDom(dom);
  await Promise.all([
    writeConfigFile(configFilePath, domWithoutComponents),
    writeCodeComponentsToFiles(componentsFolder, componentsContent),
    writeQueriesFile(),
  ]);
}

export async function saveLocalDom(dom: appDom.AppDom): Promise<void> {
  if (config.cmd !== 'dev') {
    throw new Error(`Writing to disk is only possible in toolpad dev mode.`);
  }

  await writeDomToDisk(dom);
}

async function loadConfigFile() {
  const configFilePath = getConfigFilePath();
  try {
    const configContent = await fs.readFile(configFilePath, { encoding: 'utf-8' });
    const parsedConfig = yaml.parse(configContent);
    return parsedConfig;
  } catch (rawError) {
    const error = errorFrom(rawError);
    if (error.code === 'ENOENT') {
      if (config.cmd !== 'dev') {
        throw new Error(`No application found at "${configFilePath}".`);
      }

      const dom = appDom.createDefaultDom();
      await saveLocalDom(dom);
      return dom;
    }
    throw error;
  }
}

export async function loadDomFromDisk(): Promise<appDom.AppDom> {
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
  await execFile('code', [userProjectRoot, '--goto', fullPath]);
}

export async function openCodeComponentEditor(componentName: string): Promise<void> {
  const componentsFolder = getComponentFolder();
  const filePath = getComponentFilePath(componentsFolder, componentName);
  const userProjectRoot = getUserProjectRoot();
  await execFile('code', [userProjectRoot, '--goto', filePath]);
}

async function getQueriesFileContent(): Promise<string | null> {
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
  const [dom, queriesFile] = await Promise.all([loadLocalDom(), getQueriesFileContent()]);
  return (
    insecureHash(JSON.stringify(dom)) + insecureHash(queriesFile || DEFAULT_QUERIES_FILE_CONTENT)
  );
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
