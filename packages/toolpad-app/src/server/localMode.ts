import * as yaml from 'yaml';
import * as path from 'path';
import * as fs from 'fs/promises';
import invariant from 'invariant';
import * as child_process from 'child_process';
import { promisify } from 'util';
import config from '../config';
import * as appDom from '../appDom';
import { errorFrom } from '../utils/errors';
import insecureHash from '../utils/insecureHash';

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
  const entries = await fs.readdir(componentsFolder, { withFileTypes: true });
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

function extractComponentsContentFromDom(dom: appDom.AppDom): ComponentsContent {
  const rootNode = appDom.getApp(dom);
  const { codeComponents: codeComponentNodes = [] } = appDom.getChildNodes(dom, rootNode);
  return Object.fromEntries(
    codeComponentNodes.map((node) => [node.name, node.attributes.code.value]),
  );
}

export async function loadConfigFile(filePath: string): Promise<appDom.AppDom> {
  try {
    const configContent = await fs.readFile(filePath, { encoding: 'utf-8' });
    const parsedConfig = yaml.parse(configContent);
    return parsedConfig;
  } catch (rawError) {
    const error = errorFrom(rawError);
    if (error.code === 'ENOENT') {
      const dom = appDom.createDefaultDom();
      await writeConfigFile(filePath, dom);
      return dom;
    }
    throw error;
  }
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
  const componentsContent = extractComponentsContentFromDom(dom);
  await Promise.all([
    writeConfigFile(configFilePath, dom),
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

export async function loadDomFromDisk(): Promise<appDom.AppDom> {
  const configFilePath = getConfigFilePath();
  try {
    const [configContent, componentsContent] = await Promise.all([
      fs.readFile(configFilePath, { encoding: 'utf-8' }),
      loadCodeComponentsFromFiles(),
    ]);
    const parsedConfig = yaml.parse(configContent);
    const dom = mergeComponentsContentIntoDom(parsedConfig, componentsContent);
    return dom;
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

export async function loadLocalDom(): Promise<appDom.AppDom> {
  return loadDomFromDisk();
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
