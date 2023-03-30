import * as yaml from 'yaml';
import * as path from 'path';
import * as fs from 'fs/promises';
import invariant from 'invariant';
import * as chokidar from 'chokidar';
import { debounce } from 'lodash';
import Emitter from '@mui/toolpad-core/utils/Emitter';
import openEditor from 'open-editor';
import chalk from 'chalk';
import { BindableAttrValue, NodeId } from '@mui/toolpad-core';
import { fromZodError } from 'zod-validation-error';
import config from '../config';
import * as appDom from '../appDom';
import { errorFrom } from '../utils/errors';
import { migrateUp } from '../appDom/migrations';
import insecureHash from '../utils/insecureHash';
import { writeFileRecursive, readMaybeFile, readMaybeDir } from '../utils/fs';
import { PageType, QueryType, ElementType, NavigationActionType, Page } from './schema';
import { mapValues } from '../utils/collections';

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

function getComponentsFolder(root: string): string {
  return path.resolve(getToolpadFolder(root), './components');
}

function getQueriesFile(root: string): string {
  return path.resolve(getToolpadFolder(root), './queries.ts');
}

function getDomFile(root: string): string {
  return path.resolve(getToolpadFolder(root), './toolpad.yml');
}

function getComponentFolder(root: string): string {
  const toolpadFolder = getToolpadFolder(root);
  return path.resolve(toolpadFolder, './components');
}

function getPagesFolder(root: string): string {
  const toolpadFolder = getToolpadFolder(root);
  return path.resolve(toolpadFolder, './pages');
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
  const componentsFolder = getComponentFolder(root);
  const entries = (await readMaybeDir(componentsFolder)) || [];
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

async function loadPagesFromFiles(root: string): Promise<PagesContent> {
  const pagesFolder = getPagesFolder(root);
  const entries = (await readMaybeDir(pagesFolder)) || [];
  const resultEntries = await Promise.all(
    entries.map(async (entry): Promise<[string, PageType] | null> => {
      if (entry.isDirectory()) {
        const pageName = entry.name;
        const filePath = path.resolve(pagesFolder, pageName, './page.yml');
        const content = await readMaybeFile(filePath);
        if (!content) {
          return null;
        }
        let parsedFile: string | undefined;
        try {
          parsedFile = yaml.parse(content);
        } catch (rawError) {
          const error = errorFrom(rawError);

          console.error(
            `${chalk.red('error')} - Failed to read page ${chalk.cyan(pageName)}. ${error.message}`,
          );

          return null;
        }

        const result = Page.safeParse(parsedFile);
        if (result.success) {
          return [pageName, result.data];
        }

        console.error(
          `${chalk.red('error')} - Failed to read page ${chalk.cyan(pageName)}. ${fromZodError(
            result.error,
          )}`,
        );

        return null;
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
    writeFileRecursive(filePath, yaml.stringify(dom), { encoding: 'utf-8' }),
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
    await writeConfigFile(configFilePath, defaultDom);
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

async function initProjectFolder(): Promise<void> {
  try {
    const root = getUserProjectRoot();
    if (config.cmd === 'dev') {
      await initToolpadFolder(root);
      await Promise.all([
        initGeneratedGitignore(root),
        initToolpadFile(root),
        initQueriesFile(root),
      ]);
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

function toBindable<V>(value: V | { $$jsExpression: string }): BindableAttrValue<V> {
  if (value && typeof value === 'object' && typeof (value as any).$$jsExpression === 'string') {
    return { type: 'jsExpression', value: (value as any).$$jsExpression };
  }
  return { type: 'const', value: value as V };
}

function fromBindable<V>(bindable: BindableAttrValue<V>) {
  switch (bindable.type) {
    case 'const':
      return bindable.value;
    case 'jsExpression':
      return { $$jsExpression: bindable.value };
    default:
      throw new Error(`Unsupported bindable "${bindable.type}"`);
  }
}

function toBindableProp<V>(value: V | { $$jsExpression: string }): BindableAttrValue<V> {
  if (value && typeof value === 'object') {
    if (typeof (value as any).$$jsExpression === 'string') {
      return { type: 'jsExpression', value: (value as any).$$jsExpression };
    }
    if (typeof (value as any).$$jsExpressionAction === 'string') {
      return { type: 'jsExpressionAction', value: (value as any).$$jsExpressionAction };
    }
    if (typeof (value as any).$$navigationAction === 'string') {
      const action = value as any as NavigationActionType;
      return {
        type: 'navigationAction',
        value: {
          page: { $$ref: action.$$navigationAction.page as NodeId },
          parameters: mapValues(
            action.$$navigationAction.parameters,
            (param) => param && toBindable(param),
          ),
        },
      };
    }
  }
  return { type: 'const', value: value as V };
}

function fromBindableProp<V>(bindable: BindableAttrValue<V>) {
  switch (bindable.type) {
    case 'const':
      return bindable.value;
    case 'jsExpression':
      return { $$jsExpression: bindable.value };
    case 'jsExpressionAction':
      return { $$jsExpressionAction: bindable.value };
    case 'navigationAction':
      return {
        $$navigationAction: {
          page: bindable.value.page.$$ref,
          parameters:
            bindable.value.parameters &&
            mapValues(bindable.value.parameters, (param) => param && fromBindable(param)),
        },
      };
    default:
      throw new Error(`Unsupported bindable "${bindable.type}"`);
  }
}

function stringOnly(maybeString: unknown): string | undefined {
  return typeof maybeString === 'string' ? maybeString : undefined;
}

function expandChildren(children: appDom.ElementNode[], dom: appDom.AppDom): ElementType[];
function expandChildren(children: appDom.QueryNode[], dom: appDom.AppDom): QueryType[];
function expandChildren<N extends appDom.AppDomNode>(
  children: N[],
  dom: appDom.AppDom,
): (QueryType | ElementType)[];
function expandChildren<N extends appDom.AppDomNode>(children: N[], dom: appDom.AppDom) {
  return (
    children
      .sort((child1, child2) => {
        invariant(
          child1.parentIndex && child2.parentIndex,
          'Nodes are not children of another node',
        );
        return appDom.compareFractionalIndex(child1.parentIndex, child2.parentIndex);
      })
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      .map((child) => expandFromDom(child, dom))
  );
}

function undefinedWhenEmpty<O extends object | any[]>(obj?: O): O | undefined {
  if (!obj || Object.values(obj).every((property) => property === undefined)) {
    return undefined;
  }
  return obj;
}

function expandFromDom(node: appDom.ElementNode, dom: appDom.AppDom): ElementType;
function expandFromDom(node: appDom.QueryNode, dom: appDom.AppDom): QueryType;
function expandFromDom(node: appDom.PageNode, dom: appDom.AppDom): PageType;
function expandFromDom<N extends appDom.AppDomNode>(
  node: N,
  dom: appDom.AppDom,
): PageType | QueryType | ElementType;
function expandFromDom<N extends appDom.AppDomNode>(
  node: N,
  dom: appDom.AppDom,
): PageType | QueryType | ElementType {
  if (appDom.isPage(node)) {
    const children = appDom.getChildNodes(dom, node);

    return {
      id: node.id,
      title: node.attributes.title?.value,
      parameters: undefinedWhenEmpty(
        node.attributes.parameters?.value.map(([name, value]) => ({ name, value })) ?? [],
      ),
      children: undefinedWhenEmpty(expandChildren(children.children || [], dom)),
      queries: undefinedWhenEmpty(expandChildren(children.queries || [], dom)),
    } satisfies PageType;
  }

  if (appDom.isQuery(node)) {
    return {
      name: node.name,
      enabled: node.attributes.enabled ? fromBindable(node.attributes.enabled) : undefined,
      mode: node.attributes.mode?.value,
      dataSource: node.attributes.dataSource?.value,
      query: node.attributes.query.value,
      parameters: undefinedWhenEmpty(node.params?.map(([name, value]) => ({ name, value }))),
      cacheTime: node.attributes.cacheTime?.value,
      refetchInterval: node.attributes.refetchInterval?.value,
      transform: node.attributes.transform?.value,
      transformEnabled: node.attributes.transformEnabled?.value,
    } satisfies QueryType;
  }

  if (appDom.isElement(node)) {
    const children = appDom.getChildNodes(dom, node);

    return {
      component: node.attributes.component.value,
      name: node.name,
      layout: undefinedWhenEmpty({
        columnSize: node.layout?.columnSize?.value,
        horizontalAlign: stringOnly(node.layout?.horizontalAlign?.value),
        verticalAlign: stringOnly(node.layout?.verticalAlign?.value),
      }),
      props: undefinedWhenEmpty(
        mapValues(node.props || {}, (prop) => prop && fromBindableProp(prop)),
      ),
      children: undefinedWhenEmpty(expandChildren(children.children || [], dom)),
    } satisfies ElementType;
  }

  throw new Error(`Unsupported node type "${node.type}"`);
}

function mergeElementIntoDom(
  dom: appDom.AppDom,
  parent: appDom.ElementNode | appDom.PageNode,
  elm: ElementType,
): appDom.AppDom {
  const elmNode = appDom.createElement(
    dom,
    elm.component,
    mapValues(elm.props || {}, (propValue) => toBindableProp(propValue)),
    mapValues(elm.layout || {}, (propValue) => appDom.createConst(propValue)),
    elm.name,
  );
  dom = appDom.addNode(dom, elmNode, parent, 'children');

  if (elm.children) {
    for (const child of elm.children) {
      dom = mergeElementIntoDom(dom, elmNode, child);
    }
  }

  return dom;
}

function mergePageIntoDom(dom: appDom.AppDom, pageName: string, pageFile: PageType): appDom.AppDom {
  const pageNode = appDom.createNode(dom, 'page', {
    name: pageName,
    attributes: {
      title: appDom.createConst(pageFile.title || ''),
      parameters: appDom.createConst(
        pageFile.parameters?.map(({ name, value }) => [name, value]) || [],
      ),
    },
  });
  pageNode.id = pageFile.id;
  if (appDom.getMaybeNode(dom, pageFile.id)) {
    dom = appDom.removeNode(dom, pageFile.id);
  }
  dom = appDom.addNode(dom, pageNode, appDom.getApp(dom), 'pages');

  if (pageFile.queries) {
    for (const query of pageFile.queries) {
      const queryNode = appDom.createNode(dom, 'query', {
        name: query.name,
        attributes: {
          connectionId: appDom.createConst(null),
          dataSource:
            typeof query.dataSource === 'string' ? appDom.createConst(query.dataSource) : undefined,
          query: appDom.createConst(query.query),
          cacheTime:
            typeof query.cacheTime === 'number' ? appDom.createConst(query.cacheTime) : undefined,
          enabled: query.enabled ? toBindable(query.enabled) : undefined,
          mode: typeof query.mode === 'string' ? appDom.createConst(query.mode) : undefined,
          transform:
            typeof query.transform === 'string' ? appDom.createConst(query.transform) : undefined,
          refetchInterval:
            typeof query.refetchInterval === 'number'
              ? appDom.createConst(query.refetchInterval)
              : undefined,
          transformEnabled: query.transformEnabled
            ? appDom.createConst(query.transformEnabled)
            : undefined,
        },
      });
      dom = appDom.addNode(dom, queryNode, pageNode, 'queries');
    }
  }

  if (pageFile.children) {
    for (const child of pageFile.children) {
      dom = mergeElementIntoDom(dom, pageNode, child);
    }
  }

  return dom;
}

function mergPagesIntoDom(dom: appDom.AppDom, pages: PagesContent): appDom.AppDom {
  for (const [name, page] of Object.entries(pages)) {
    dom = mergePageIntoDom(dom, name, page);
  }
  return dom;
}

type PagesContent = Record<string, PageType>;

interface ExtractedPages {
  pages: PagesContent;
  dom: appDom.AppDom;
}

function extractNewPagesFromDom(dom: appDom.AppDom): ExtractedPages {
  const rootNode = appDom.getApp(dom);
  const { pages: pageNodes = [] } = appDom.getChildNodes(dom, rootNode);

  const pages: PagesContent = {};

  for (const pageNode of pageNodes) {
    if (pageNode.attributes.isNew?.value) {
      pages[pageNode.name] = expandFromDom(pageNode, dom);
    }
    dom = appDom.removeNode(dom, pageNode.id);
  }

  return { pages, dom };
}

async function writePagesToFiles(pagesFolder: string, pages: PagesContent) {
  await Promise.all(
    Object.entries(pages).map(async ([name, page]) => {
      const pageFolder = path.resolve(pagesFolder, name);
      const pageFileName = path.resolve(pageFolder, 'page.yml');
      await fs.mkdir(pageFolder, { recursive: true });
      await fs.writeFile(pageFileName, yaml.stringify(page));
    }),
  );
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
  const root = getUserProjectRoot();
  const configFilePath = await getConfigFilePath(root);
  const componentsFolder = getComponentFolder(root);
  const pagesFolder = getPagesFolder(root);

  const { components: componentsContent, dom: domWithoutComponents } =
    extractNewComponentsContentFromDom(dom);
  dom = domWithoutComponents;

  const { pages: pagesContent, dom: domWithoutPages } = extractNewPagesFromDom(dom);
  dom = domWithoutPages;

  await Promise.all([
    writeConfigFile(configFilePath, dom),
    writeCodeComponentsToFiles(componentsFolder, componentsContent),
    writePagesToFiles(pagesFolder, pagesContent),
  ]);
}

export async function saveLocalDom(dom: appDom.AppDom): Promise<void> {
  if (config.cmd !== 'dev') {
    throw new Error(`Writing to disk is only possible in toolpad dev mode.`);
  }

  await writeDomToDisk(dom);
}

async function loadConfigFileFrom(configFilePath: string): Promise<appDom.AppDom | null> {
  await isInitialized;
  // Using a lock to avoid read during write which may result in reading truncated file content
  const configContent = await configFileLock.use(() => readMaybeFile(configFilePath));

  if (!configContent) {
    return null;
  }

  const parsedConfig = yaml.parse(configContent);
  invariant(parsedConfig, 'Invalid Toolpad config');
  return parsedConfig;
}

async function loadConfigFile() {
  const root = getUserProjectRoot();
  const configFilePath = await getConfigFilePath(root);
  const dom = await loadConfigFileFrom(configFilePath);

  if (dom) {
    return dom;
  }

  throw new Error(`No toolpad dom found`);
}

export async function loadDomFromDisk(): Promise<appDom.AppDom> {
  const root = getUserProjectRoot();
  await isInitialized;
  const [configContent, componentsContent, pagesContent] = await Promise.all([
    loadConfigFile(),
    loadCodeComponentsFromFiles(root),
    loadPagesFromFiles(root),
  ]);
  let dom = configContent;
  dom = mergeComponentsContentIntoDom(configContent, componentsContent);

  const app = appDom.getApp(dom);
  const { pages = [] } = appDom.getChildNodes(dom, app);
  for (const page of pages) {
    dom = appDom.removeNode(dom, page.id);
  }

  dom = mergPagesIntoDom(configContent, pagesContent);
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
  const root = getUserProjectRoot();
  const componentsFolder = getComponentFolder(root);
  const fullPath = getComponentFilePath(componentsFolder, componentName);
  const userProjectRoot = getUserProjectRoot();
  openEditor([fullPath, userProjectRoot], {
    editor: process.env.EDITOR ? undefined : 'vscode',
  });
}

async function getQueriesFileContent(root: string): Promise<string | null> {
  await isInitialized;
  return readMaybeFile(getQueriesFile(root));
}

export async function getDomFingerprint() {
  const root = getUserProjectRoot();
  const [configContent, componentsContent, queriesFile, pagesContent] = await Promise.all([
    loadConfigFile(),
    loadCodeComponentsFromFiles(root),
    getQueriesFileContent(root),
    loadPagesFromFiles(root),
  ]);

  return insecureHash(
    JSON.stringify([configContent, componentsContent, queriesFile, pagesContent]),
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
async function readDomFile(root: string): Promise<DomFile | null> {
  const filepath = getDomFile(root);
  const configContent = await readMaybeFile(filepath);

  if (!configContent) {
    return null;
  }

  const parsedConfig = yaml.parse(configContent);
  return {
    name: 'dom',
    kind: 'dom',
    filepath,
    hash: String(insecureHash(configContent)),
    content: parsedConfig,
  };
}

async function readQueriesFile(root: string): Promise<QueriesFile | null> {
  const filepath = getQueriesFile(root);
  const content = await readMaybeFile(filepath);

  if (!content) {
    return null;
  }

  return {
    name: 'queries',
    kind: 'queries',
    filepath,
    hash: String(insecureHash(content)),
    content,
  };
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
