import { NodeId, BindableAttrValue } from '@mui/toolpad-core';
import * as _ from 'lodash-es';
import {
  App,
  DomNodeAttributeType,
  PrismaClient,
  Release,
  Prisma,
} from '../../prisma/generated/client';
import { ServerDataSource, ApiResult, VersionOrPreview, GithubReleaseCache } from '../types';
import serverDataSources from '../toolpadDataSources/server';
import * as appDom from '../appDom';
import { omit } from '../utils/immutability';
import { asArray } from '../utils/collections';
import { decryptSecret, encryptSecret } from './secrets';
import applyTransform from './applyTransform';

// See https://github.com/prisma/prisma/issues/5042#issuecomment-1104679760
function excludeFields<T, K extends (keyof T)[]>(
  fields: T,
  excluded: K,
): Record<Exclude<keyof T, K[number]>, boolean> {
  const result = {} as Record<Exclude<keyof T, K[number]>, boolean>;
  for (const key of Object.keys(fields)) {
    if (!excluded.includes(key as any)) {
      result[key as Exclude<keyof T, K[number]>] = true;
    }
  }
  return result;
}

const SELECT_RELEASE_META = excludeFields(Prisma.ReleaseScalarFieldEnum, ['snapshot']);
const SELECT_APP_META = excludeFields(Prisma.AppScalarFieldEnum, ['dom']);

export type AppMeta = Omit<App, 'dom'>;

function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient();
  }

  // avoid Next.js dev server from creating too many prisma clients
  // See https://github.com/prisma/prisma/issues/1983
  if (!(globalThis as any).prisma) {
    (globalThis as any).prisma = new PrismaClient();
  }

  return (globalThis as any).prisma;
}

const prisma = getPrismaClient();

function deserializeValue(dbValue: string, type: DomNodeAttributeType): unknown {
  const serialized = type === 'secret' ? decryptSecret(dbValue) : dbValue;
  return serialized.length <= 0 ? undefined : JSON.parse(serialized);
}

function encryptSecrets(dom: appDom.AppDom): appDom.AppDom {
  // TODO: use better method than clone + update (immer would work well here)
  const result = _.cloneDeep(dom);
  for (const node of Object.values(result.nodes)) {
    const namespaces = omit(node, ...appDom.RESERVED_NODE_PROPERTIES);
    for (const namespace of Object.values(namespaces)) {
      for (const value of Object.values(namespace)) {
        if (value.type === 'secret') {
          const serialized = value.value === undefined ? '' : JSON.stringify(value.value);
          value.value = encryptSecret(serialized);
        }
      }
    }
  }
  return result;
}

function decryptSecrets(dom: appDom.AppDom): appDom.AppDom {
  // TODO: use better method than clone + update (immer would work well here)
  const result = _.cloneDeep(dom);
  for (const node of Object.values(result.nodes)) {
    const namespaces = omit(node, ...appDom.RESERVED_NODE_PROPERTIES);
    for (const namespace of Object.values(namespaces)) {
      for (const value of Object.values(namespace)) {
        if (value.type === 'secret') {
          const decrypted = decryptSecret(value.value);
          value.value = decrypted.length <= 0 ? undefined : JSON.parse(decrypted);
        }
      }
    }
  }
  return result;
}

export async function saveDom(appId: string, app: appDom.AppDom): Promise<void> {
  await prisma.app.update({
    where: {
      id: appId,
    },
    data: { editedAt: new Date(), dom: encryptSecrets(app) as any },
    select: SELECT_APP_META,
  });
}

async function loadPreviewDomLegacy(appId: string): Promise<appDom.AppDom> {
  const dbNodes = await prisma.domNode.findMany({
    where: { appId },
    include: { attributes: true },
  });

  const root = dbNodes.find((node) => !node.parentId)?.id as NodeId;
  const nodes = Object.fromEntries(
    dbNodes.map((node): [NodeId, appDom.AppDomNode] => {
      const nodeId = node.id as NodeId;

      return [
        nodeId,
        {
          id: nodeId,
          type: node.type,
          name: node.name,
          parentId: node.parentId as NodeId | null,
          parentProp: node.parentProp,
          parentIndex: node.parentIndex,
          attributes: {},
          ...node.attributes.reduce((result, attribute) => {
            if (!result[attribute.namespace]) {
              result[attribute.namespace] = {};
            }
            result[attribute.namespace][attribute.name] = {
              type: attribute.type,
              value: deserializeValue(attribute.value, attribute.type),
            } as BindableAttrValue<unknown>;
            return result;
          }, {} as Record<string, Record<string, BindableAttrValue<unknown>>>),
        } as appDom.AppDomNode,
      ];
    }),
  );

  if (!root) {
    throw new Error(`App "${appId}" not found`);
  }

  return {
    root,
    nodes,
  };
}

async function loadPreviewDom(appId: string): Promise<appDom.AppDom> {
  const { dom } = await prisma.app.findUniqueOrThrow({
    where: { id: appId },
  });

  if (dom) {
    return decryptSecrets(dom as any);
  }

  return loadPreviewDomLegacy(appId);
}

export async function getApps(): Promise<AppMeta[]> {
  return prisma.app.findMany({
    orderBy: {
      editedAt: 'desc',
    },
    select: SELECT_APP_META,
  });
}

export async function getActiveDeployments() {
  return prisma.deployment.findMany({
    distinct: ['appId'],
    orderBy: { createdAt: 'desc' },
  });
}

export async function getApp(id: string): Promise<AppMeta | null> {
  return prisma.app.findUnique({ where: { id }, select: SELECT_APP_META });
}

function createDefaultDom(): appDom.AppDom {
  let dom = appDom.createDom();
  const appNode = appDom.getApp(dom);

  // Create default page
  const newPageNode = appDom.createNode(dom, 'page', {
    name: 'Page 1',
    attributes: {
      title: appDom.createConst('Page 1'),
    },
  });

  dom = appDom.addNode(dom, newPageNode, appNode, 'pages');

  return dom;
}

export interface CreateAppOptions {
  dom?: appDom.AppDom | null;
}

export async function createApp(name: string, opts: CreateAppOptions = {}): Promise<App> {
  return prisma.$transaction(async () => {
    const app = await prisma.app.create({
      data: { name },
    });

    const dom = opts.dom || createDefaultDom();

    await saveDom(app.id, dom);

    return app;
  });
}

export async function updateApp(appId: string, name: string): Promise<void> {
  await prisma.app.update({
    where: {
      id: appId,
    },
    data: { name },
    select: {
      // Only return the id to reduce amount of data returned from the db
      id: true,
    },
  });
}

export async function deleteApp(id: string): Promise<void> {
  await prisma.app.delete({
    where: { id },
    select: {
      // Only return the id to reduce amount of data returned from the db
      id: true,
    },
  });
}

interface CreateReleaseParams {
  description: string;
}

async function findLastReleaseInternal(appId: string) {
  return prisma.release.findFirst({
    where: { appId },
    orderBy: { version: 'desc' },
  });
}

export async function findLastRelease(appId: string) {
  return prisma.release.findFirst({
    where: { appId },
    orderBy: { version: 'desc' },
    select: SELECT_RELEASE_META,
  });
}

export async function createRelease(
  appId: string,
  { description }: CreateReleaseParams,
): Promise<Pick<Release, keyof typeof SELECT_RELEASE_META>> {
  const currentDom = await loadPreviewDom(appId);
  const snapshot = Buffer.from(JSON.stringify(currentDom), 'utf-8');

  const lastRelease = await findLastReleaseInternal(appId);
  const versionNumber = lastRelease ? lastRelease.version + 1 : 1;

  const release = await prisma.release.create({
    select: SELECT_RELEASE_META,
    data: {
      appId,
      version: versionNumber,
      description,
      snapshot,
    },
  });

  return release;
}

export async function getReleases(appId: string) {
  return prisma.release.findMany({
    where: { appId },
    select: SELECT_RELEASE_META,
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getRelease(appId: string, version: number) {
  return prisma.release.findUnique({
    where: { release_app_constraint: { appId, version } },
    select: SELECT_RELEASE_META,
  });
}

export async function createDeployment(appId: string, version: number) {
  return prisma.deployment.create({
    data: {
      app: {
        connect: { id: appId },
      },
      release: {
        connect: { release_app_constraint: { appId, version } },
      },
    },
  });
}

export async function findActiveDeployment(appId: string) {
  return prisma.deployment.findFirst({
    where: { appId },
    orderBy: { createdAt: 'desc' },
    include: {
      release: {
        select: SELECT_RELEASE_META,
      },
    },
  });
}

export async function loadReleaseDom(appId: string, version: number): Promise<appDom.AppDom> {
  const release = await prisma.release.findUnique({
    where: { release_app_constraint: { appId, version } },
  });
  if (!release) {
    throw new Error(`release doesn't exist`);
  }
  return JSON.parse(release.snapshot.toString('utf-8')) as appDom.AppDom;
}

export async function getConnectionParams<P = unknown>(
  appId: string,
  connectionId: string | null,
): Promise<P | null> {
  const dom = await loadPreviewDom(appId);
  const node = appDom.getNode(
    dom,
    connectionId as NodeId,
    'connection',
  ) as appDom.ConnectionNode<P>;
  return node.attributes.params.value;
}

export async function setConnectionParams<P>(
  appId: string,
  connectionId: NodeId,
  params: P,
): Promise<void> {
  let dom = await loadPreviewDom(appId);
  const existing = appDom.getNode(dom, connectionId, 'connection');

  dom = appDom.setNodeNamespacedProp(
    dom,
    existing,
    'attributes',
    'params',
    appDom.createSecret(params),
  );

  await saveDom(appId, dom);
}

export async function execQuery<P, Q>(
  appId: string,
  dataNode: appDom.QueryNode<Q> | appDom.MutationNode<Q>,
  params: Q,
): Promise<ApiResult<any>> {
  if (appDom.isQuery(dataNode)) {
    dataNode = appDom.fromLegacyQueryNode(dataNode);
  }

  const dataSource: ServerDataSource<P, Q, any> | undefined =
    dataNode.attributes.dataSource && serverDataSources[dataNode.attributes.dataSource.value];
  if (!dataSource) {
    throw new Error(
      `Unknown datasource "${dataNode.attributes.dataSource?.value}" for query "${dataNode.id}"`,
    );
  }

  const connectionParams = dataNode.attributes.connectionId.value
    ? await getConnectionParams<P>(appId, appDom.deref(dataNode.attributes.connectionId.value))
    : null;

  let result = await dataSource.exec(connectionParams, dataNode.attributes.query.value, params);

  if (appDom.isQuery(dataNode)) {
    const transformEnabled = dataNode.attributes.transformEnabled?.value;
    const transform = dataNode.attributes.transform?.value;
    if (transformEnabled && transform) {
      result = {
        data: await applyTransform(transform, result.data),
      };
    }
  }

  return result;
}

export async function dataSourceFetchPrivate<P, Q>(
  appId: string,
  dataSourceId: string,
  connectionId: NodeId | null,
  query: Q,
): Promise<any> {
  const dataSource: ServerDataSource<P, Q, any> | undefined = serverDataSources[dataSourceId];

  if (!dataSource) {
    throw new Error(`Unknown dataSource "${dataSourceId}"`);
  }

  if (!dataSource.execPrivate) {
    throw new Error(`No execPrivate available on datasource "${dataSourceId}"`);
  }

  const connectionParams: P | null = connectionId
    ? await getConnectionParams<P>(appId, connectionId)
    : null;

  return dataSource.execPrivate(connectionParams, query);
}

export function parseVersion(param?: string | string[]): VersionOrPreview | null {
  if (!param) {
    return null;
  }
  const [maybeVersion] = asArray(param);
  if (maybeVersion === 'preview') {
    return maybeVersion;
  }
  const parsed = Number(maybeVersion);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function loadDom(appId: string, version: VersionOrPreview = 'preview') {
  return version === 'preview' ? loadPreviewDom(appId) : loadReleaseDom(appId, version);
}

/**
 * Version of loadDom that returns a subset of the dom that doesn't contain sensitive information
 */
export async function loadRenderTree(appId: string, version: VersionOrPreview = 'preview') {
  return appDom.createRenderTree(await loadDom(appId, version));
}

const LATEST_RELEASE_API_URL = 'https://api.github.com/repos/mui/mui-toolpad/releases/latest';

const latestReleaseCache: GithubReleaseCache = {
  nextFetchAllowedAt: Number.NEGATIVE_INFINITY,
  releasePromise: null,
};

export function getLatestToolpadRelease(): Promise<Response> {
  const timestamp = Date.now();
  if (latestReleaseCache.nextFetchAllowedAt > timestamp && latestReleaseCache.releasePromise) {
    return latestReleaseCache.releasePromise;
  }
  // Fetch latest release from the Github API
  // https://developer.github.com/v3/repos/releases/#get-the-latest-release
  const ac = new AbortController();
  setTimeout(() => {
    ac.abort('Timeout on fetching new release');
  }, 30000);
  latestReleaseCache.releasePromise = fetch(LATEST_RELEASE_API_URL, {
    // Use AbortSignal.timeout() when https://github.com/microsoft/TypeScript/issues/48003  is fixed
    signal: ac.signal,
  });
  latestReleaseCache.nextFetchAllowedAt = timestamp + 1000 * 60 * 10;
  return latestReleaseCache.releasePromise;
}
