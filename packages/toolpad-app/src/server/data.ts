import { NodeId, BindableAttrValue, ExecFetchResult } from '@mui/toolpad-core';
import * as _ from 'lodash-es';
import * as prisma from '../../prisma/generated/client';
import { ServerDataSource, VersionOrPreview, AppTemplateId } from '../types';
import serverDataSources from '../toolpadDataSources/server';
import * as appDom from '../appDom';
import { omit } from '../utils/immutability';
import { asArray } from '../utils/collections';
import { decryptSecret, encryptSecret } from './secrets';
import applyTransform from './applyTransform';
import { excludeFields } from '../utils/prisma';
import { latestVersion, latestMigration } from '../appDomMigrations';
import { getAppTemplateDom } from './appTemplateDoms/doms';
import { validateRecaptchaToken } from './validateRecaptchaToken';
import config from './config';

const SELECT_RELEASE_META = excludeFields(prisma.Prisma.ReleaseScalarFieldEnum, ['snapshot']);
const SELECT_APP_META = excludeFields(prisma.Prisma.AppScalarFieldEnum, ['dom']);

export type AppMeta = Omit<prisma.App, 'dom'>;

function getPrismaClient(): prisma.PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    return new prisma.PrismaClient();
  }

  // avoid Next.js dev server from creating too many prisma clients
  // See https://github.com/prisma/prisma/issues/1983
  if (!(globalThis as any).prisma) {
    (globalThis as any).prisma = new prisma.PrismaClient();
  }

  return (globalThis as any).prisma;
}

const prismaClient = getPrismaClient();

function deserializeValue(dbValue: string, type: prisma.DomNodeAttributeType): unknown {
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
  await prismaClient.app.update({
    where: {
      id: appId,
    },
    data: { editedAt: new Date(), dom: encryptSecrets(app) as any },
    select: SELECT_APP_META,
  });
}

async function loadPreviewDomLegacy(appId: string): Promise<appDom.AppDom> {
  const dbNodes = await prismaClient.domNode.findMany({
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
    // Legacy dom has version '0'
    version: 0,
  };
}

async function loadPreviewDom(appId: string): Promise<appDom.AppDom> {
  const { dom } = await prismaClient.app.findUniqueOrThrow({
    where: { id: appId },
  });

  let decryptedDom: appDom.AppDom;

  if (dom) {
    decryptedDom = decryptSecrets(dom as any);
  } else {
    decryptedDom = await loadPreviewDomLegacy(appId);
  }

  if (decryptedDom.version === latestVersion) {
    return decryptedDom;
  }

  if (!latestMigration) {
    throw new Error('No migrations found');
  }

  return latestMigration.up(decryptedDom);
}

export async function getApps(): Promise<AppMeta[]> {
  if (process.env.TOOLPAD_DEMO) {
    return [];
  }

  return prismaClient.app.findMany({
    orderBy: {
      editedAt: 'desc',
    },
    select: SELECT_APP_META,
  });
}

export async function getActiveDeployments() {
  return prismaClient.deployment.findMany({
    distinct: ['appId'],
    orderBy: { createdAt: 'desc' },
  });
}

export async function getApp(id: string): Promise<AppMeta | null> {
  return prismaClient.app.findUnique({ where: { id }, select: SELECT_APP_META });
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

export type CreateAppOptions = {
  from?:
    | {
        kind: 'dom';
        dom?: appDom.AppDom | null;
      }
    | {
        kind: 'template';
        id: AppTemplateId;
      };
  recaptchaToken?: string;
};

export async function createApp(name: string, opts: CreateAppOptions = {}): Promise<prisma.App> {
  const { from } = opts;

  const recaptchaSecretKey = config.recaptchaSecretKey;
  if (recaptchaSecretKey) {
    const isRecaptchaTokenValid = await validateRecaptchaToken(
      recaptchaSecretKey,
      opts.recaptchaToken || '',
    );

    if (!isRecaptchaTokenValid) {
      throw new Error('Unable to verify CAPTCHA.');
    }
  }

  let appName = name.trim();

  if (process.env.TOOLPAD_DEMO) {
    appName = appName.replace(/\(#[0-9]+\)/g, '').trim();

    const sameNameAppCount = await prismaClient.app.count({
      where: { OR: [{ name: appName }, { name: { startsWith: `${appName} (#`, endsWith: ')' } }] },
    });
    if (sameNameAppCount > 0) {
      appName = `${appName} (#${sameNameAppCount + 1})`;
    }
  }

  if (await prismaClient.app.findUnique({ where: { name: appName } })) {
    throw new Error(`An app named "${name}" already exists.`);
  }

  return prismaClient.$transaction(async () => {
    const app = await prismaClient.app.create({
      data: { name: appName },
    });

    let dom: appDom.AppDom | null = null;

    if (from && from.kind === 'dom') {
      dom = from.dom || null;
    } else if (from && from.kind === 'template') {
      dom = await getAppTemplateDom(from.id || 'blank');
    }

    if (!dom) {
      dom = createDefaultDom();
    }

    await saveDom(app.id, dom);

    return app;
  });
}

interface AppUpdates {
  name?: string;
  public?: boolean;
}

export async function updateApp(appId: string, updates: AppUpdates): Promise<void> {
  await prismaClient.app.update({
    where: {
      id: appId,
    },
    data: _.pick(updates, ['name', 'public']),
    select: {
      // Only return the id to reduce amount of data returned from the db
      id: true,
    },
  });
}

export async function deleteApp(id: string): Promise<void> {
  await prismaClient.app.delete({
    where: { id },
    select: {
      // Only return the id to reduce amount of data returned from the db
      id: true,
    },
  });
}

export interface CreateReleaseParams {
  description: string;
}

export type ReleaseMeta = Pick<prisma.Release, keyof typeof SELECT_RELEASE_META>;

async function findLastReleaseInternal(appId: string) {
  return prismaClient.release.findFirst({
    where: { appId },
    orderBy: { version: 'desc' },
  });
}

export async function findLastRelease(appId: string): Promise<ReleaseMeta | null> {
  return prismaClient.release.findFirst({
    where: { appId },
    orderBy: { version: 'desc' },
    select: SELECT_RELEASE_META,
  });
}

export async function createRelease(
  appId: string,
  { description }: CreateReleaseParams,
): Promise<ReleaseMeta> {
  const currentDom = await loadPreviewDom(appId);
  const snapshot = Buffer.from(JSON.stringify(currentDom), 'utf-8');

  const lastRelease = await findLastReleaseInternal(appId);
  const versionNumber = lastRelease ? lastRelease.version + 1 : 1;

  const release = await prismaClient.release.create({
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

export async function getReleases(appId: string): Promise<ReleaseMeta[]> {
  return prismaClient.release.findMany({
    where: { appId },
    select: SELECT_RELEASE_META,
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getRelease(appId: string, version: number): Promise<ReleaseMeta | null> {
  return prismaClient.release.findUnique({
    where: { release_app_constraint: { appId, version } },
    select: SELECT_RELEASE_META,
  });
}

export type Deployment = prisma.Deployment & {
  release: ReleaseMeta;
};

export function getDeployments(appId: string): Promise<Deployment[]> {
  return prismaClient.deployment.findMany({
    where: { appId },
    orderBy: { createdAt: 'desc' },
    include: {
      release: {
        select: SELECT_RELEASE_META,
      },
    },
  });
}

export async function createDeployment(appId: string, version: number): Promise<Deployment> {
  return prismaClient.deployment.create({
    data: {
      app: {
        connect: { id: appId },
      },
      release: {
        connect: { release_app_constraint: { appId, version } },
      },
    },
    include: {
      release: {
        select: SELECT_RELEASE_META,
      },
    },
  });
}

export async function deploy(
  appId: string,
  releaseInput: CreateReleaseParams,
): Promise<Deployment> {
  const release = await createRelease(appId, releaseInput);
  const deployment = await createDeployment(appId, release.version);
  return deployment;
}

export async function findActiveDeployment(appId: string): Promise<Deployment | null> {
  return prismaClient.deployment.findFirst({
    where: { appId },
    orderBy: { createdAt: 'desc' },
    include: {
      release: {
        select: SELECT_RELEASE_META,
      },
    },
  });
}

function parseSnapshot(snapshot: Buffer): appDom.AppDom {
  return JSON.parse(snapshot.toString('utf-8')) as appDom.AppDom;
}

async function loadReleaseDom(appId: string, version: number): Promise<appDom.AppDom> {
  const release = await prismaClient.release.findUnique({
    where: { release_app_constraint: { appId, version } },
  });
  if (!release) {
    throw new Error(`release doesn't exist`);
  }
  return parseSnapshot(release.snapshot);
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
): Promise<ExecFetchResult<any>> {
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

export async function duplicateApp(id: string, name: string): Promise<AppMeta> {
  const dom = await loadPreviewDom(id);
  const duplicateCount = await prismaClient.app.count({
    where: { name: { startsWith: `${name} (copy`, endsWith: ')' } },
  });
  const duplicateName =
    duplicateCount === 0 ? `${name} (copy)` : `${name} (copy ${duplicateCount + 1})`;
  const newApp = await createApp(duplicateName, {
    from: {
      kind: 'dom',
      dom,
    },
  });
  return newApp;
}
