import * as path from 'path';
import * as fs from 'fs/promises';
import { isMainThread } from 'worker_threads';
import * as yaml from 'yaml';
import invariant from 'invariant';
import openEditor from 'open-editor';
import chalk from 'chalk';
import { BindableAttrValue, EnvAttrValue, PropBindableAttrValue } from '@mui/toolpad-core';
import { fromZodError } from 'zod-validation-error';
import { glob } from 'glob';
import * as chokidar from 'chokidar';
import { debounce, throttle } from 'lodash-es';
import { Emitter } from '@mui/toolpad-utils/events';
import { guessTitle } from '@mui/toolpad-utils/strings';
import { errorFrom } from '@mui/toolpad-utils/errors';
import { filterValues, hasOwnProperty, mapValues } from '@mui/toolpad-utils/collections';
import { execa } from 'execa';
import {
  writeFileRecursive,
  readMaybeFile,
  readMaybeDir,
  updateYamlFile,
  fileExists,
  readJsonFile,
} from '@mui/toolpad-utils/fs';
import { z } from 'zod';
import { Awaitable } from '@mui/toolpad-utils/types';
import * as appDom from '@mui/toolpad-core/appDom';
import insecureHash from '../utils/insecureHash';
import {
  Page,
  Query,
  ElementType,
  pageSchema,
  Template,
  BindableProp,
  LocalQueryConfig,
  FetchQueryConfig,
  QueryConfig,
  FetchBody,
  ResponseType,
  Theme,
  themeSchema,
  API_VERSION,
  applicationSchema,
  Application,
  envBindingSchema,
} from './schema';
import { format, resolvePrettierConfig } from '../utils/prettier';
import {
  Body as AppDomFetchBody,
  FetchQuery,
  ResponseType as AppDomRestResponseType,
} from '../toolpadDataSources/rest/types';
import { LocalQuery } from '../toolpadDataSources/local/types';
import type {
  RuntimeConfig,
  ProjectEvents,
  ToolpadProjectOptions,
  CodeEditorFileType,
} from '../types';
import EnvManager from './EnvManager';
import FunctionsManager, { CreateDataProviderOptions } from './FunctionsManager';
import { VersionInfo, checkVersion } from './versionInfo';
import { VERSION_CHECK_INTERVAL } from '../constants';
import DataManager from './DataManager';
import { PAGE_COLUMN_COMPONENT_ID, PAGE_ROW_COMPONENT_ID } from '../runtime/toolpadComponents';
import packageInfo from '../packageInfo';

declare global {
  // eslint-disable-next-line
  var __toolpadProjects: Set<string> | undefined;
}

invariant(
  isMainThread,
  'localMode should be used only in the main thread. Use message passing to get data from the main thread.',
);

function getThemeFile(root: string): string {
  return path.join(root, './theme.yml');
}

function getApplicationFile(root: string): string {
  return path.join(root, './application.yml');
}

function getComponentsFolder(root: string): string {
  return path.join(root, './components');
}

function getPagesFolder(root: string): string {
  return path.join(root, './pages');
}

function getPageFolder(root: string, name: string): string {
  const pagesFolder = getPagesFolder(root);
  const pageFolder = path.resolve(pagesFolder, name);
  return pageFolder;
}

function getPageFile(root: string, name: string): string {
  const pageFolder = getPageFolder(root, name);
  const pageFileName = path.resolve(pageFolder, 'page.yml');
  return pageFileName;
}

function getComponentFilePath(componentsFolder: string, componentName: string): string {
  return path.join(componentsFolder, `${componentName}.tsx`);
}

function getOutputFolder(root: string) {
  return path.join(root, '.generated');
}

function getAppOutputFolder(root: string) {
  return path.join(getOutputFolder(root), 'app');
}

export interface ComponentEntry {
  name: string;
  path: string;
}

export type ComponentsManifest = ComponentEntry[];

async function loadPagesFromFiles(root: string): Promise<PagesContent> {
  const pagesFolder = getPagesFolder(root);
  const entries = await readMaybeDir(pagesFolder);
  const resultEntries = await Promise.all(
    entries.map(async (entry): Promise<[string, Page] | null> => {
      if (entry.isDirectory()) {
        const pageName = entry.name;

        const pageDirEntries = new Set(await fs.readdir(path.resolve(pagesFolder, pageName)));

        if (pageDirEntries.has('page.yml')) {
          const ymlFilePath = path.resolve(pagesFolder, pageName, './page.yml');
          const ymlContent = await readMaybeFile(ymlFilePath);

          if (ymlContent) {
            let parsedFile: Page | undefined;
            try {
              parsedFile = yaml.parse(ymlContent);
            } catch (rawError) {
              const error = errorFrom(rawError);

              console.error(
                `${chalk.red('error')} - Failed to read page ${chalk.cyan(pageName)}. ${
                  error.message
                }`,
              );

              return null;
            }

            const result = pageSchema.safeParse(parsedFile);

            if (result.success) {
              return [pageName, result.data];
            }

            console.error(
              `${chalk.red('error')} - Failed to read page ${chalk.cyan(pageName)}. ${fromZodError(
                result.error,
              )}`,
            );
          }
        }

        const extensions = ['.tsx', '.jsx'];

        for (const extension of extensions) {
          if (pageDirEntries.has(`page${extension}`)) {
            return [
              pageName,
              {
                apiVersion: API_VERSION,
                kind: 'page',
                spec: {
                  id: pageName,
                  unstable_codeFile: true,
                },
              } satisfies Page,
            ];
          }
        }
      }

      return null;
    }),
  );

  return Object.fromEntries(resultEntries.filter(Boolean));
}

async function loadObjectFromFile<T extends z.ZodType>(
  filePath: string,
  schema: T,
): Promise<z.infer<T> | null> {
  const content = await readMaybeFile(filePath);
  if (content) {
    const parsedFile = yaml.parse(content);
    const result = schema.safeParse(parsedFile);
    if (result.success) {
      return result.data;
    }

    console.error(
      `${chalk.red('error')} - Failed to read theme ${chalk.cyan(filePath)}. ${fromZodError(
        result.error,
      )}`,
    );

    return null;
  }
  return null;
}

async function loadThemeFromFile(root: string): Promise<Theme | null> {
  const themeFilePath = getThemeFile(root);
  return loadObjectFromFile(themeFilePath, themeSchema);
}

async function loadApplicationFromFile(root: string): Promise<Application | null> {
  const applicationFilePath = getApplicationFile(root);
  return loadObjectFromFile(applicationFilePath, applicationSchema);
}

async function createDefaultCodeComponent(name: string, filePath: string): Promise<string> {
  const componentId = name.replace(/\s/g, '');
  const propTypeId = `${componentId}Props`;
  const result = await format(
    `
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
        type: "string",
        default: "Hello world!"
      },
    },
  });    
`,
    filePath,
  );
  return result;
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

const buildInfoSchema = z.object({
  timestamp: z.number(),
  base: z.string().optional(),
});

type BuildInfo = z.infer<typeof buildInfoSchema>;

const DEFAULT_GENERATED_GITIGNORE_FILE_CONTENT = '.generated\n';

async function initGitignore(root: string) {
  const generatedGitignorePath = path.resolve(root, '.gitignore');
  if (!(await fileExists(generatedGitignorePath))) {
    // eslint-disable-next-line no-console
    console.log(`${chalk.blue('info')}  - Initializing .gitignore file`);
    await writeFileRecursive(generatedGitignorePath, DEFAULT_GENERATED_GITIGNORE_FILE_CONTENT, {
      encoding: 'utf-8',
    });
  }
}

function mergeThemeIntoAppDom(dom: appDom.AppDom, themeFile: Theme): appDom.AppDom {
  const themeFileSpec = themeFile.spec;
  const app = appDom.getApp(dom);
  dom = appDom.addNode(
    dom,
    appDom.createNode(dom, 'theme', {
      theme: themeFileSpec?.options,
      attributes: {},
    }),
    app,
    'themes',
  );
  return dom;
}

function mergeApplicationIntoDom(dom: appDom.AppDom, applicationFile: Application): appDom.AppDom {
  const applicationFileSpec = applicationFile.spec;
  const app = appDom.getApp(dom);

  dom = appDom.setNodeNamespacedProp(dom, app, 'attributes', 'authentication', {
    ...applicationFileSpec?.authentication,
  });

  dom = appDom.setNodeNamespacedProp(dom, app, 'attributes', 'authorization', {
    ...applicationFileSpec?.authorization,
    roles: applicationFileSpec?.authorization?.roles?.map((role) =>
      typeof role === 'string' ? { name: role } : role,
    ),
  });

  return dom;
}

function stringOnly(maybeString: unknown): string | undefined {
  return typeof maybeString === 'string' ? maybeString : undefined;
}

function expandChildren(children: appDom.ElementNode[], dom: appDom.AppDom): ElementType[];
function expandChildren(children: appDom.QueryNode[], dom: appDom.AppDom): Query[];
function expandChildren<N extends appDom.AppDomNode>(
  children: N[],
  dom: appDom.AppDom,
): (Query | ElementType)[];
function expandChildren<N extends appDom.AppDomNode>(children: N[], dom: appDom.AppDom) {
  return children
    .sort((child1, child2) => {
      invariant(child1.parentIndex && child2.parentIndex, 'Nodes are not children of another node');
      return appDom.compareFractionalIndex(child1.parentIndex, child2.parentIndex);
    })
    .map((child) => expandFromDom(child, dom));
}

function undefinedWhenEmpty<O extends object | any[]>(obj?: O): O | undefined {
  if (!obj || Object.values(obj).every((property) => property === undefined)) {
    return undefined;
  }
  return obj;
}

function createPageFileQueryFromDomQuery(
  dataSource: string,
  query: FetchQuery | LocalQuery | undefined,
): QueryConfig {
  switch (dataSource) {
    case 'rest': {
      if (!query) {
        return { kind: 'rest' };
      }
      query = query as FetchQuery;

      let body: FetchBody | undefined;

      if (query.body) {
        switch (query.body.kind) {
          case 'raw': {
            body = {
              kind: 'raw',
              content: query.body.content as PropBindableAttrValue<string>,
              contentType: query.body.contentType,
            };
            break;
          }
          case 'urlEncoded': {
            body = {
              kind: 'urlEncoded',
              content: query.body.content.map(([name, value]) => ({
                name,
                value: value as PropBindableAttrValue<string>,
              })),
            };
            break;
          }
          default:
            throw new Error(`Unrecognized body kind "${(query.body as any).kind}"`);
        }
      }

      let response: ResponseType | undefined;

      if (query.response) {
        switch (query.response.kind) {
          case 'csv': {
            response = { kind: 'csv', headers: query.response.headers };
            break;
          }
          case 'json': {
            response = { kind: 'json' };
            break;
          }
          case 'xml': {
            response = { kind: 'xml' };
            break;
          }
          case 'raw': {
            response = { kind: 'raw' };
            break;
          }
          default:
            throw new Error(`Unrecognized response kind "${(query.response as any).kind}"`);
        }
      }

      return {
        kind: 'rest',
        url: query.url as PropBindableAttrValue<string>,
        searchParams: query.searchParams?.map(([name, value]) => ({
          name,
          value: value as PropBindableAttrValue<string>,
        })),
        headers: query.headers.map(([name, value]) => ({
          name,
          value: value as PropBindableAttrValue<string>,
        })),
        body,
        method: query.method,
        response,
        transform: query.transform,
        transformEnabled: query.transformEnabled,
      } satisfies FetchQueryConfig;
    }
    case 'local':
      if (!query) {
        return { kind: 'local' };
      }

      query = query as LocalQuery;
      return {
        function: query.function,
        kind: 'local',
      } satisfies LocalQueryConfig;
    default:
      throw new Error(`Unsupported dataSource "${dataSource}"`);
  }
}

function expandFromDom(node: appDom.ElementNode, dom: appDom.AppDom): ElementType;
function expandFromDom(node: appDom.QueryNode, dom: appDom.AppDom): Query;
function expandFromDom(node: appDom.PageNode, dom: appDom.AppDom): Page;
function expandFromDom<N extends appDom.AppDomNode>(
  node: N,
  dom: appDom.AppDom,
): Page | Query | ElementType;
function expandFromDom<N extends appDom.AppDomNode>(
  node: N,
  dom: appDom.AppDom,
): Page | Query | ElementType {
  if (appDom.isPage(node)) {
    const children = appDom.getChildNodes(dom, node);

    return {
      apiVersion: API_VERSION,
      kind: 'page',
      spec: {
        displayName: node.attributes.displayName,
        alias: node.attributes.alias,
        title: node.attributes.title,
        parameters: undefinedWhenEmpty(
          node.attributes.parameters?.map(([name, value]) => ({ name, value })) ?? [],
        ),
        content: undefinedWhenEmpty(expandChildren(children.children || [], dom)),
        queries: undefinedWhenEmpty(expandChildren(children.queries || [], dom)),
        display: node.attributes.display,
        unstable_codeFile: node.attributes.codeFile,
        authorization: node.attributes.authorization,
      },
    } satisfies Page;
  }

  if (appDom.isQuery(node)) {
    return {
      name: node.name,
      enabled: node.attributes.enabled as PropBindableAttrValue<boolean>,
      mode: node.attributes.mode,
      query: node.attributes.dataSource
        ? createPageFileQueryFromDomQuery(
            node.attributes.dataSource,
            node.attributes.query as FetchQuery | LocalQuery | undefined,
          )
        : undefined,
      parameters: undefinedWhenEmpty(node.params?.map(([name, value]) => ({ name, value }))),
      cacheTime: node.attributes.cacheTime,
      refetchInterval: node.attributes.refetchInterval,
      transform: node.attributes.transform,
      transformEnabled: node.attributes.transformEnabled,
    } satisfies Query;
  }

  if (appDom.isElement(node)) {
    const { children, ...templates } = appDom.getChildNodes(dom, node);

    const templateProps = mapValues(templates, (subtree) =>
      subtree
        ? {
            $$template: expandChildren(subtree, dom),
          }
        : undefined,
    );

    return {
      component: node.attributes.component,
      name: node.name,
      layout: undefinedWhenEmpty({
        columnSize: node.layout?.columnSize,
        horizontalAlign: stringOnly(node.layout?.horizontalAlign),
        verticalAlign: stringOnly(node.layout?.verticalAlign),
      }),
      props: undefinedWhenEmpty({ ...node.props, ...templateProps }),
      children: undefinedWhenEmpty(expandChildren(children || [], dom)),
    } satisfies ElementType;
  }

  throw new Error(`Unsupported node type "${node.type}"`);
}

function isTemplate(bindableProp?: BindableProp): bindableProp is Template {
  return !!(
    bindableProp &&
    typeof bindableProp === 'object' &&
    hasOwnProperty(bindableProp, '$$template')
  );
}

function mergeElementIntoDom(
  dom: appDom.AppDom,
  parent: appDom.ElementNode | appDom.PageNode,
  parentProp: string,
  elm: ElementType,
): appDom.AppDom {
  const plainProps = filterValues(elm.props ?? {}, (prop) => !isTemplate(prop)) as Record<
    string,
    Exclude<BindableProp, Template>
  >;

  const templateProps = filterValues(elm.props ?? {}, isTemplate) as Record<string, Template>;

  const elmNode = appDom.createElement(dom, elm.component, plainProps, elm.layout ?? {}, elm.name);

  dom = appDom.addNode(dom, elmNode, parent, parentProp as any);

  if (elm.children) {
    for (const child of elm.children) {
      dom = mergeElementIntoDom(dom, elmNode, 'children', child);
    }
  }

  for (const [propName, templateProp] of Object.entries(templateProps)) {
    for (const child of templateProp.$$template) {
      dom = mergeElementIntoDom(dom, elmNode, propName, child);
    }
  }

  return dom;
}

function createDomQueryFromPageFileQuery(query: QueryConfig): FetchQuery | LocalQuery {
  switch (query.kind) {
    case 'local':
      return {
        function: query.function,
      } satisfies LocalQuery;
    case 'rest': {
      let body: AppDomFetchBody | undefined;

      if (query.body) {
        switch (query.body.kind) {
          case 'raw': {
            body = {
              kind: 'raw',
              content: query.body.content,
              contentType: query.body.contentType,
            };
            break;
          }
          case 'urlEncoded': {
            body = {
              kind: 'urlEncoded',
              content: query.body.content.map(({ name, value }) => [
                name,
                value as PropBindableAttrValue<string>,
              ]),
            };
            break;
          }
          default:
            throw new Error(`Unrecognized body kind "${(query.body as any).kind}"`);
        }
      }

      let response: AppDomRestResponseType | undefined;

      if (query.response) {
        switch (query.response.kind) {
          case 'csv': {
            response = { kind: 'csv', headers: query.response.headers };
            break;
          }
          case 'json': {
            response = { kind: 'json' };
            break;
          }
          case 'xml': {
            response = { kind: 'xml' };
            break;
          }
          case 'raw': {
            response = { kind: 'raw' };
            break;
          }
          default:
            throw new Error(`Unrecognized response kind "${(query.response as any).kind}"`);
        }
      }

      return {
        url: query.url || undefined,
        headers: query.headers?.map(({ name, value }) => [name, value]) || [],
        method: query.method || 'GET',
        browser: false,
        transform: query.transform,
        transformEnabled: query.transformEnabled,
        searchParams: query.searchParams?.map(({ name, value }) => [name, value]) || [],
        body,
        response,
      } satisfies FetchQuery;
    }
    default:
      throw new Error(`Unrecognized query kind "${(query as any).kind}"`);
  }
}

function createPageDomFromPageFile(pageName: string, pageFile: Page): appDom.AppDom {
  const pageFileSpec = pageFile.spec ?? {};

  let fragment = appDom.createFragment('page', {
    name: pageName,
    attributes: {
      displayName: pageFileSpec.displayName,
      // Convert deprecated id to alias
      alias: pageFileSpec.id ? [pageFileSpec.id] : pageFileSpec.alias,
      title: pageFileSpec.title,
      parameters: pageFileSpec.parameters?.map(({ name, value }) => [name, value]) || [],
      display: pageFileSpec.display || undefined,
      codeFile: pageFileSpec.unstable_codeFile || undefined,
      authorization: pageFileSpec.authorization || undefined,
    },
  });

  const pageNode = appDom.getRoot(fragment);
  appDom.assertIsPage(pageNode);

  if (pageFileSpec.queries) {
    for (const query of pageFileSpec.queries) {
      if (query.query) {
        const queryNode = appDom.createNode(fragment, 'query', {
          name: query.name,
          attributes: {
            connectionId: null,
            dataSource: typeof query.query?.kind === 'string' ? query.query.kind : undefined,
            query: createDomQueryFromPageFileQuery(query.query),
            cacheTime: typeof query.cacheTime === 'number' ? query.cacheTime : undefined,
            enabled: query.enabled ?? undefined,
            mode: typeof query.mode === 'string' ? query.mode : undefined,
            transform: typeof query.transform === 'string' ? query.transform : undefined,
            refetchInterval:
              typeof query.refetchInterval === 'number' ? query.refetchInterval : undefined,
            transformEnabled: query.transformEnabled ?? undefined,
          },
          params: query.parameters?.map(
            ({ name, value }) => [name, value] satisfies [string, BindableAttrValue<any>],
          ),
        });
        fragment = appDom.addNode(fragment, queryNode, pageNode, 'queries');
      }
    }
  }

  if (pageFileSpec.content) {
    for (const child of pageFileSpec.content) {
      fragment = mergeElementIntoDom(fragment, pageNode, 'children', child);
    }
  }

  return fragment;
}

function mergePageIntoDom(dom: appDom.AppDom, pageName: string, pageFile: Page): appDom.AppDom {
  const appRoot = appDom.getRoot(dom);
  const pageFragment = createPageDomFromPageFile(pageName, pageFile);

  const newPageNode = appDom.getRoot(pageFragment);

  if (appDom.getMaybeNode(dom, newPageNode.id)) {
    dom = appDom.removeNode(dom, newPageNode.id);
  }

  dom = appDom.addFragment(dom, pageFragment, appRoot.id, 'pages');

  return dom;
}

function optimizePageElement(element: ElementType): ElementType {
  const isLayoutElement = (possibleLayoutElement: ElementType): boolean =>
    possibleLayoutElement.component === PAGE_ROW_COMPONENT_ID ||
    possibleLayoutElement.component === PAGE_COLUMN_COMPONENT_ID;

  if (isLayoutElement(element) && element.children?.length === 1) {
    const onlyChild = element.children[0];

    if (!isLayoutElement(onlyChild)) {
      return optimizePageElement({
        ...onlyChild,
        layout: {
          ...onlyChild.layout,
          columnSize: 1,
        },
      });
    }
  }

  return {
    ...element,
    children: element.children && element.children.map(optimizePageElement),
  };
}

function optimizePage(page: Page): Page {
  return {
    ...page,
    spec: {
      ...page.spec,
      content: page.spec?.content?.map(optimizePageElement),
    },
  };
}

function mergePagesIntoDom(dom: appDom.AppDom, pages: PagesContent): appDom.AppDom {
  for (const [name, page] of Object.entries(pages)) {
    dom = mergePageIntoDom(dom, name, optimizePage(page));
  }
  return dom;
}

type PagesContent = Record<string, Page>;

interface ExtractedPages {
  pages: PagesContent;
  dom: appDom.AppDom;
}

function extractPagesFromDom(dom: appDom.AppDom): ExtractedPages {
  const rootNode = appDom.getApp(dom);
  const { pages: pageNodes = [] } = appDom.getChildNodes(dom, rootNode);

  const pages: PagesContent = {};

  for (const pageNode of pageNodes) {
    pages[pageNode.name] = expandFromDom(pageNode, dom);
    dom = appDom.removeNode(dom, pageNode.id);
  }

  return { pages, dom };
}

function extractThemeFromDom(dom: appDom.AppDom): Theme | null {
  const rootNode = appDom.getApp(dom);
  const { themes: themeNodes = [] } = appDom.getChildNodes(dom, rootNode);
  if (themeNodes.length > 0) {
    return {
      apiVersion: API_VERSION,
      kind: 'theme',
      spec: {
        options: themeNodes[0].theme,
      },
    };
  }

  return null;
}

function extractApplicationFromDom(dom: appDom.AppDom): Application | null {
  const rootNode = appDom.getApp(dom);

  return {
    apiVersion: API_VERSION,
    kind: 'application',
    spec: {
      authentication: rootNode.attributes.authentication,
      authorization: rootNode.attributes.authorization,
    },
  };
}

function getSchemaUrl(obj: string) {
  return `https://raw.githubusercontent.com/mui/mui-toolpad/v${packageInfo.version}/docs/schemas/v1/definitions.json#properties/${obj}`;
}

async function writePagesToFiles(root: string, pages: PagesContent) {
  await Promise.all(
    Object.entries(pages).map(async ([name, page]) => {
      const pageFileName = getPageFile(root, name);
      await updateYamlFile(pageFileName, optimizePage(page), {
        schemaUrl: getSchemaUrl('Page'),
      });
    }),
  );
}

async function writeThemeFile(root: string, theme: Theme | null) {
  const themeFilePath = getThemeFile(root);
  if (theme) {
    await updateYamlFile(themeFilePath, theme, {
      schemaUrl: getSchemaUrl('Theme'),
    });
  } else {
    await fs.rm(themeFilePath, { recursive: true, force: true });
  }
}

async function writeApplicationFile(root: string, application: Application | null) {
  const applicationFilePath = getApplicationFile(root);
  if (application) {
    await updateYamlFile(applicationFilePath, application);
  } else {
    await fs.rm(applicationFilePath, { recursive: true, force: true });
  }
}

async function writeDomToDisk(root: string, dom: appDom.AppDom): Promise<void> {
  const { pages: pagesContent } = extractPagesFromDom(dom);
  await Promise.all([
    writePagesToFiles(root, pagesContent),
    writeThemeFile(root, extractThemeFromDom(dom)),
    writeApplicationFile(root, extractApplicationFromDom(dom)),
  ]);
}

export async function findSupportedEditor(): Promise<string | undefined> {
  if (process.env.EDITOR) {
    return undefined;
  }
  try {
    await execa('code', ['-v']);
    return 'code';
  } catch (err) {
    return undefined;
  }
}

export type ProjectFolderEntry = {
  name: string;
  kind: 'query';
  filepath: string;
};

interface ToolpadProjectFolder {
  application: Application | null;
  pages: Record<string, Page>;
  theme: Theme | null;
}

async function readProjectFolder(root: string): Promise<ToolpadProjectFolder> {
  const [pagesContent, theme, application] = await Promise.all([
    loadPagesFromFiles(root),
    loadThemeFromFile(root),
    loadApplicationFromFile(root),
  ]);

  return {
    application,
    pages: pagesContent,
    theme,
  };
}

async function writeProjectFolder(root: string, folder: ToolpadProjectFolder): Promise<void> {
  await Promise.all([
    writePagesToFiles(root, folder.pages),
    writeThemeFile(root, folder.theme),
    writeApplicationFile(root, folder.application),
  ]);
}

function projectFolderToAppDom(projectFolder: ToolpadProjectFolder): appDom.AppDom {
  let dom = appDom.createDom();
  dom = mergePagesIntoDom(dom, projectFolder.pages);
  if (projectFolder.theme) {
    dom = mergeThemeIntoAppDom(dom, projectFolder.theme);
  }
  if (projectFolder.application) {
    dom = mergeApplicationIntoDom(dom, projectFolder.application);
  }
  return dom;
}

async function loadProjectFolder(root: string): Promise<ToolpadProjectFolder> {
  return readProjectFolder(root);
}

export async function loadDomFromDisk(root: string): Promise<appDom.AppDom> {
  const projectFolder = await loadProjectFolder(root);

  return projectFolderToAppDom(projectFolder);
}

function getDomFilePatterns(root: string) {
  return [
    path.resolve(root, './pages/*/page.yml'),
    path.resolve(root, './theme.yml'),
    path.resolve(root, './application.yml'),
  ];
}
/**
 * Calculates a fingerprint from all files that influence the dom structure
 */
async function calculateDomFingerprint(root: string): Promise<number> {
  const files = await glob(getDomFilePatterns(root), { windowsPathsNoEscape: true });

  const mtimes = await Promise.all(
    files.sort().map(async (file) => {
      const stats = await fs.stat(file);
      return [file, stats.mtimeMs];
    }),
  );

  return insecureHash(JSON.stringify(mtimes));
}

function findEnvBindings(obj: unknown): EnvAttrValue[] {
  if (Array.isArray(obj)) {
    return obj.flatMap((item) => findEnvBindings(item));
  }

  if (obj && typeof obj === 'object') {
    try {
      return [envBindingSchema.parse(obj)];
    } catch {
      return Object.values(obj).flatMap((value) => findEnvBindings(value));
    }
  }

  return [];
}

export function getRequiredEnvVars(dom: appDom.AppDom): Set<string> {
  const allVars = Object.values(dom.nodes)
    .flatMap((node) => findEnvBindings(node))
    .map((binding) => binding.$$env);

  return new Set(allVars);
}

class ToolpadProject {
  private root: string;

  events = new Emitter<ProjectEvents>();

  private domAndFingerprint: Awaitable<[appDom.AppDom, number]> | null = null;

  private domAndFingerprintLock = new Lock();

  options: ToolpadProjectOptions;

  envManager: EnvManager;

  functionsManager: FunctionsManager;

  dataManager: DataManager;

  invalidateQueries: () => void;

  private alertedMissingVars = new Set<string>();

  private lastVersionCheck = 0;

  private pendingVersionCheck: Promise<VersionInfo> | undefined;

  private componentsManifestPromise: Promise<ComponentsManifest> | undefined;

  private pagesManifestPromise: Promise<PagesManifest> | undefined;

  constructor(root: string, options: ToolpadProjectOptions) {
    invariant(
      // eslint-disable-next-line no-underscore-dangle
      !global.__toolpadProjects?.has(root),
      `A project is already running for "${root}"`,
    );
    // eslint-disable-next-line no-underscore-dangle
    global.__toolpadProjects ??= new Set();
    // eslint-disable-next-line no-underscore-dangle
    global.__toolpadProjects.add(root);

    this.root = root;
    this.options = options;

    this.envManager = new EnvManager(this);
    this.functionsManager = new FunctionsManager(this);
    this.dataManager = new DataManager(this);

    this.invalidateQueries = throttle(
      () => {
        this.events.emit('queriesInvalidated', {});
      },
      250,
      {
        leading: false,
      },
    );
  }

  private initWatcher() {
    if (!this.options.dev) {
      return;
    }

    const updateDomFromExternal = debounce(() => {
      this.domAndFingerprintLock.use(async () => {
        const [, fingerprint] = await this.loadDomAndFingerprint();
        const newFingerprint = await calculateDomFingerprint(this.root);
        if (fingerprint !== newFingerprint) {
          // eslint-disable-next-line no-console
          console.log(`${chalk.magenta('event')} - Project changed on disk, updating...`);
          this.domAndFingerprint = await Promise.all([
            loadDomFromDisk(this.root),
            calculateDomFingerprint(this.root),
          ]);
          this.events.emit('change', {});
          this.events.emit('externalChange', {});
        }
      });
    }, 100);

    const watchOptions: chokidar.WatchOptions = {
      // This is needed to correctly pick up page folder renames
      // Remove this once https://github.com/paulmillr/chokidar/issues/1285 gets resolved
      usePolling: true,
    };

    chokidar.watch(getDomFilePatterns(this.root), watchOptions).on('all', () => {
      updateDomFromExternal();
    });

    const handleComponentFileChange = async () => {
      const oldManifest = await this.componentsManifestPromise;
      this.componentsManifestPromise = this.buildComponentsManifest();
      const newManifest = await this.componentsManifestPromise;
      if (JSON.stringify(oldManifest) !== JSON.stringify(newManifest)) {
        this.events.emit('componentsListChanged', {});
      }
    };

    chokidar
      .watch(
        [path.resolve(this.root, './components'), path.resolve(this.root, './components/*.*')],
        watchOptions,
      )
      .on('add', handleComponentFileChange)
      .on('addDir', handleComponentFileChange)
      .on('unlink', handleComponentFileChange)
      .on('unlinkDir', handleComponentFileChange);

    const handlePageFileChange = async () => {
      const oldManifest = await this.pagesManifestPromise;
      this.pagesManifestPromise = buildPagesManifest(this.root);
      const newManifest = await this.pagesManifestPromise;
      if (JSON.stringify(oldManifest) !== JSON.stringify(newManifest)) {
        this.events.emit('pagesManifestChanged', {});
      }
    };

    chokidar
      .watch(
        [path.resolve(this.root, './pages'), path.resolve(this.root, './pages/*/page.*')],
        watchOptions,
      )
      .on('add', handlePageFileChange)
      .on('addDir', handlePageFileChange)
      .on('unlink', handlePageFileChange)
      .on('unlinkDir', handlePageFileChange);
  }

  private async loadDomAndFingerprint() {
    if (!this.domAndFingerprint) {
      this.domAndFingerprint = Promise.all([
        loadDomFromDisk(this.root),
        calculateDomFingerprint(this.root),
      ]);
    }
    return this.domAndFingerprint;
  }

  getRoot() {
    return this.root;
  }

  getOutputFolder() {
    return getOutputFolder(this.getRoot());
  }

  getAppOutputFolder() {
    return getAppOutputFolder(this.getRoot());
  }

  getBuildInfoFile() {
    return path.resolve(this.getOutputFolder(), 'buildInfo.json');
  }

  alertOnMissingVariablesInDom(dom: appDom.AppDom) {
    const requiredVars = getRequiredEnvVars(dom);
    const missingVars = Array.from(requiredVars).filter(
      (key) => typeof process.env[key] === 'undefined',
    );
    const toAlert = missingVars.filter((key) => !this.alertedMissingVars.has(key));

    if (toAlert.length > 0) {
      const firstThree = toAlert.slice(0, 3);
      const restCount = toAlert.length - firstThree.length;
      const missingListMsg = firstThree.map((varName) => chalk.cyan(varName)).join(', ');
      const restMsg = restCount > 0 ? ` and ${restCount} more` : '';

      // eslint-disable-next-line no-console
      console.log(
        `${chalk.yellow(
          'warn',
        )}  - Missing required environment variable(s): ${missingListMsg}${restMsg}.`,
      );
    }

    // Only alert once per missing variable
    this.alertedMissingVars = new Set(missingVars);
  }

  async start() {
    if (this.options.dev) {
      await this.resetBuildInfo();
      await this.initWatcher();
    } else {
      const buildInfo = await this.getBuildInfo();
      if (!buildInfo) {
        throw new Error(`No production build found. Please run "toolpad build" first.`);
      }

      if (buildInfo.base !== this.options.base) {
        throw new Error(
          `Production build found for base "${buildInfo.base}" but running the app with "${this.options.base}". Please run "toolpad build" with the correct --base option.`,
        );
      }
    }
    await Promise.all([this.envManager.start(), this.functionsManager.start()]);
  }

  async build() {
    await Promise.all([this.envManager.build(), this.functionsManager.build()]);
  }

  async dispose() {
    await Promise.all([this.envManager.dispose(), this.functionsManager.dispose()]);
    // eslint-disable-next-line no-underscore-dangle
    global.__toolpadProjects?.delete(this.root);
  }

  async loadDom() {
    const [dom] = await this.loadDomAndFingerprint();
    this.alertOnMissingVariablesInDom(dom);
    return dom;
  }

  async buildComponentsManifest(): Promise<ComponentsManifest> {
    const componentsFolder = getComponentsFolder(this.getRoot());
    const entries = (await readMaybeDir(componentsFolder)) || [];
    const result = entries.map((entry) => {
      if (entry.isFile()) {
        const fileName = entry.name;
        const componentName = entry.name.replace(/\.tsx$/, '');
        const filePath = path.resolve(componentsFolder, fileName);
        return { name: componentName, path: filePath };
      }
      return null;
    });
    return result.filter(Boolean);
  }

  async getComponentsManifest(): Promise<ComponentsManifest> {
    if (!this.componentsManifestPromise) {
      this.componentsManifestPromise = this.buildComponentsManifest();
    }
    return this.componentsManifestPromise;
  }

  async writeDomToDisk(newDom: appDom.AppDom) {
    if (!this.options.dev) {
      throw new Error(`Writing to disk is only possible in toolpad dev mode.`);
    }

    await writeDomToDisk(this.root, newDom);
    const newFingerprint = await calculateDomFingerprint(this.root);
    this.domAndFingerprint = [newDom, newFingerprint];
    this.events.emit('change', { fingerprint: newFingerprint });
  }

  async init() {
    const projectFolder = await readProjectFolder(this.root);
    if (Object.keys(projectFolder.pages).length <= 0) {
      projectFolder.pages.page = {
        apiVersion: API_VERSION,
        kind: 'page',
        spec: {
          id: appDom.createId(),
          title: 'Default page',
        },
      };
      await writeProjectFolder(this.root, projectFolder);
    }

    await initGitignore(this.root);
  }

  async saveDom(newDom: appDom.AppDom) {
    await this.domAndFingerprintLock.use(async () => {
      return this.writeDomToDisk(newDom);
    });
  }

  async applyDomDiff(domDiff: appDom.DomDiff) {
    await this.domAndFingerprintLock.use(async () => {
      const dom = await this.loadDom();
      const newDom = appDom.applyDiff(dom, domDiff);
      return this.writeDomToDisk(newDom);
    });
  }

  async openCodeEditor(fileName: string, fileType: CodeEditorFileType) {
    const supportedEditor = await findSupportedEditor();
    const root = this.getRoot();
    let resolvedPath = fileName;

    if (fileType === 'resource') {
      resolvedPath = await this.functionsManager.getFunctionFilePath(fileName);
    }
    if (fileType === 'component') {
      const componentsFolder = getComponentsFolder(root);
      resolvedPath = getComponentFilePath(componentsFolder, fileName);
    }
    const fullResolvedPath = path.resolve(root, resolvedPath);
    await openEditor([fullResolvedPath, root], {
      editor: supportedEditor,
    });
  }

  async getVersionInfo(): Promise<VersionInfo> {
    const now = Date.now();
    if (!this.pendingVersionCheck || this.lastVersionCheck + VERSION_CHECK_INTERVAL <= now) {
      this.lastVersionCheck = now;
      this.pendingVersionCheck = checkVersion(this.root);
    }

    return this.pendingVersionCheck;
  }

  async createComponent(name: string) {
    const componentsFolder = getComponentsFolder(this.root);
    const filePath = getComponentFilePath(componentsFolder, name);
    const content = await createDefaultCodeComponent(name, filePath);
    await writeFileRecursive(filePath, content, { encoding: 'utf-8' });
  }

  async createDataProvider(name: string, options: CreateDataProviderOptions) {
    return this.functionsManager.createDataProviderFile(name, options);
  }

  async deletePage(name: string) {
    const pageFolder = getPageFolder(this.root, name);
    await fs.rm(pageFolder, { force: true, recursive: true });
  }

  async getPrettierConfig() {
    const root = this.getRoot();
    const config = await resolvePrettierConfig(root);
    return config;
  }

  async getRuntimeConfig(): Promise<RuntimeConfig> {
    // When these fail, you are likely trying to retrieve this information during the
    // toolpad build. It's fundamentally wrong to use this information as it strictly holds
    // information about the running toolpad instance.
    invariant(this.options.externalUrl, 'External URL is not set');

    return {
      externalUrl: this.options.externalUrl,
    };
  }

  async writeBuildInfo() {
    await writeFileRecursive(
      this.getBuildInfoFile(),
      JSON.stringify({
        timestamp: Date.now(),
        base: this.options.base,
      } satisfies BuildInfo),
      { encoding: 'utf-8' },
    );
  }

  async resetBuildInfo() {
    await fs.rm(this.getBuildInfoFile(), { force: true, recursive: true });
  }

  async getBuildInfo(): Promise<BuildInfo | null> {
    try {
      const content = await readJsonFile(this.getBuildInfoFile());
      return buildInfoSchema.parse(content);
    } catch {
      return null;
    }
  }

  async getPagesManifest(): Promise<PagesManifest> {
    if (!this.pagesManifestPromise) {
      this.pagesManifestPromise = buildPagesManifest(this.root);
    }
    return this.pagesManifestPromise;
  }
}

export type { ToolpadProject };

export function resolveProjectDir(dir: string) {
  const projectDir = path.resolve(process.cwd(), dir);
  return projectDir;
}

export interface InitProjectOptions extends Partial<ToolpadProjectOptions> {
  dir: string;
}

export async function initProject({ dir: dirInput, ...config }: InitProjectOptions) {
  const dir = resolveProjectDir(dirInput);

  const resolvedConfig: ToolpadProjectOptions = {
    toolpadDevMode: false,
    dev: false,
    base: '/prod',
    customServer: false,
    ...config,
  };

  const project = new ToolpadProject(dir, resolvedConfig);

  await project.init();

  return project;
}

const basePagesManifestEntrySchema = z.object({
  slug: z.string(),
  title: z.string(),
  legacy: z.boolean().optional(),
});

export interface PagesManifestEntry extends z.infer<typeof basePagesManifestEntrySchema> {
  children: PagesManifestEntry[];
}

const pagesManifestEntrySchema: z.ZodType<PagesManifestEntry> = basePagesManifestEntrySchema.extend(
  {
    children: z.array(z.lazy(() => pagesManifestEntrySchema)),
  },
);

const pagesManifestSchema = z.object({
  pages: z.array(pagesManifestEntrySchema),
});

export type PagesManifest = z.infer<typeof pagesManifestSchema>;

async function buildPagesManifest(root: string): Promise<PagesManifest> {
  const pagesFolder = getPagesFolder(root);
  const pageDirs = await readMaybeDir(pagesFolder);
  const pages = (
    await Promise.all(
      pageDirs.map(async (page) => {
        if (page.isDirectory()) {
          const pagePath = path.resolve(pagesFolder, page.name);
          const title = guessTitle(page.name);

          const extensions = ['.tsx', '.jsx'];

          for (const extension of extensions) {
            const pageFilePath = path.resolve(pagePath, `page${extension}`);

            // eslint-disable-next-line no-await-in-loop
            const stat = await fs.stat(pageFilePath).catch(() => null);
            if (stat?.isFile()) {
              return [
                {
                  slug: page.name,
                  title,
                  children: [],
                },
              ];
            }
          }

          const pageFilePath = path.resolve(pagePath, 'page.yml');

          const stat = await fs.stat(pageFilePath).catch(() => null);
          if (stat?.isFile()) {
            return [
              {
                slug: page.name,
                title,
                legacy: true,
                children: [],
              },
            ];
          }
        }

        return [];
      }),
    )
  ).flat();

  pages.sort((page1, page2) => page1.title.localeCompare(page2.title));

  return { pages };
}
