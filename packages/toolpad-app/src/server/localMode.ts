import * as yaml from 'yaml';
import * as path from 'path';
import * as fs from 'fs/promises';
import invariant from 'invariant';
import config from '../config';
import * as appDom from '../appDom';
import { errorFrom } from '../utils/errors';

export function getConfigFilePath() {
  const { projectDir } = config;
  invariant(projectDir, 'Toolpad in local mode must have a project directory defined');
  const filePath = path.resolve(projectDir, './toolpad.yaml');
  return filePath;
}

type ComponentsContent = Record<string, string>;

function getComponentFolder(configFilePath: string): string {
  return path.resolve(path.dirname(configFilePath), './toolpad-components');
}

async function loadCodeComponentsFromFiles(componentsFolder: string): Promise<ComponentsContent> {
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
      const filePath = path.resolve(componentsFolder, `${componentName}.tsx`);
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
  for (const node of codeComponentNodes) {
    const content = componentsContent[node.name];
    if (content) {
      dom = appDom.setNodeNamespacedProp(
        dom,
        node,
        'attributes',
        'code',
        appDom.createConst(content),
      );
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

export async function saveLocalDom(dom: appDom.AppDom): Promise<void> {
  const filePath = getConfigFilePath();
  const componentsFolder = getComponentFolder(filePath);
  const componentsContent = extractComponentsContentFromDom(dom);
  await Promise.all([
    writeConfigFile(filePath, dom),
    writeCodeComponentsToFiles(componentsFolder, componentsContent),
  ]);
}

export async function loadLocalDomFromFile(filePath: string): Promise<appDom.AppDom> {
  const componentsFolder = getComponentFolder(filePath);
  try {
    const [configContent, componentsContent] = await Promise.all([
      fs.readFile(filePath, { encoding: 'utf-8' }),
      loadCodeComponentsFromFiles(componentsFolder),
    ]);
    const parsedConfig = yaml.parse(configContent);
    const dom = mergeComponentsContentIntoDom(parsedConfig, componentsContent);
    return dom;
  } catch (rawError) {
    const error = errorFrom(rawError);
    if (error.code === 'ENOENT') {
      const dom = appDom.createDefaultDom();
      await saveLocalDom(dom);
      return dom;
    }
    throw error;
  }
}

export async function loadLocalDom(): Promise<appDom.AppDom> {
  return loadLocalDomFromFile(getConfigFilePath());
}
