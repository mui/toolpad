import { NodeId, BindableAttrValue, ExecFetchResult } from '@mui/toolpad-core';
import * as _ from 'lodash-es';
import { createServerJsRuntime } from '@mui/toolpad-core/jsServerRuntime';
import * as prisma from '../../prisma/generated/client';
import { ServerDataSource, VersionOrPreview, AppTemplateId, RuntimeState } from '../types';
import serverDataSources from '../toolpadDataSources/server';
import * as appDom from '../appDom';
import { omit } from '../utils/immutability';
import { asArray } from '../utils/collections';
import { decryptSecret } from './secrets';
import applyTransform from '../toolpadDataSources/applyTransform';
import { excludeFields } from '../utils/prisma';
import { getAppTemplateDom } from './appTemplateDoms/doms';
import { validateRecaptchaToken } from './validateRecaptchaToken';
import config from './config';
import { migrateUp } from '../appDom/migrations';
import { errorFrom } from '../utils/errors';
import { ERR_APP_EXISTS, ERR_VALIDATE_CAPTCHA_FAILED } from '../errorCodes';
import createRuntimeState from '../createRuntimeState';
import { saveLocalDom, loadLocalDom } from './localMode';

const SELECT_RELEASE_META = excludeFields(prisma.Prisma.ReleaseScalarFieldEnum, ['snapshot']);
const SELECT_APP_META = excludeFields(prisma.Prisma.AppScalarFieldEnum, ['dom']);

export type AppMeta = Omit<prisma.App, 'dom'>;

function createPrismaClient(): prisma.PrismaClient {
  if (!process.env.TOOLPAD_DATABASE_URL) {
    throw new Error(`App started without config env variable TOOLPAD_DATABASE_URL`);
  }

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

let clientInstance: prisma.PrismaClient | undefined;
function getPrismaClient(): prisma.PrismaClient {
  if (!clientInstance) {
    clientInstance = createPrismaClient();
  }
  return clientInstance;
}

function deserializeValue(dbValue: string, type: prisma.DomNodeAttributeType): unknown {
  const serialized = type === 'secret' ? decryptSecret(dbValue) : dbValue;
  return serialized.length <= 0 ? undefined : JSON.parse(serialized);
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

export async function saveDom(app: appDom.AppDom): Promise<void> {
  await saveLocalDom(app);
}

async function loadPreviewDomLegacy(appId: string): Promise<appDom.AppDom> {
  const prismaClient = getPrismaClient();
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
  const prismaClient = getPrismaClient();
  const { dom } = await prismaClient.app.findUniqueOrThrow({
    where: { id: appId },
  });

  let decryptedDom: appDom.AppDom;

  if (dom) {
    decryptedDom = decryptSecrets(dom as any);
  } else {
    decryptedDom = await loadPreviewDomLegacy(appId);
  }

  return migrateUp(decryptedDom);
}

export async function getApps(): Promise<AppMeta[]> {
  const prismaClient = getPrismaClient();
  if (config.isDemo) {
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
  const prismaClient = getPrismaClient();
  return prismaClient.deployment.findMany({
    distinct: ['appId'],
    orderBy: { createdAt: 'desc' },
  });
}

export async function getApp(id: string): Promise<AppMeta | null> {
  const prismaClient = getPrismaClient();
  return prismaClient.app.findUnique({ where: { id }, select: SELECT_APP_META });
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
  captcha?: {
    token: string;
    version: 2 | 3;
  };
};

export async function createApp(name: string, opts: CreateAppOptions = {}): Promise<prisma.App> {
  const prismaClient = getPrismaClient();
  const { from } = opts;

  if (config.recaptchaV3SecretKey) {
    const captchaVersion = opts.captcha?.version;

    const secretKey =
      captchaVersion === 2 ? config.recaptchaV2SecretKey || '' : config.recaptchaV3SecretKey;
    const isRecaptchaTokenValid = await validateRecaptchaToken(
      secretKey,
      opts.captcha?.token || '',
    );

    if (!isRecaptchaTokenValid) {
      const toolpadError = new Error(
        config.recaptchaV2SecretKey ? 'Please solve the CAPTCHA.' : 'Unable to verify CAPTCHA.',
      );
      toolpadError.code = ERR_VALIDATE_CAPTCHA_FAILED;
      throw toolpadError;
    }
  }

  const cleanAppName = name.trim();

  return prismaClient.$transaction(async () => {
    let app;
    try {
      app = await prismaClient.app.create({
        data: { name: cleanAppName },
      });
    } catch (error) {
      // https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
      // P2002: Unique constraint failed on the field
      if (error instanceof prisma.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const toolpadError = new Error(`An app named "${name}" already exists.`, { cause: error });
        toolpadError.code = ERR_APP_EXISTS;
        throw toolpadError;
      }
      throw error;
    }

    let dom: appDom.AppDom | null = null;

    if (from && from.kind === 'dom') {
      dom = from.dom ? migrateUp(from.dom) : null;
    } else if (from && from.kind === 'template') {
      dom = await getAppTemplateDom(from.id || 'blank');
    }

    if (!dom) {
      dom = appDom.createDefaultDom();
    }

    await saveDom(dom);

    return app;
  });
}

interface AppUpdates {
  name?: string;
  public?: boolean;
}

export async function updateApp(appId: string, updates: AppUpdates): Promise<void> {
  const prismaClient = getPrismaClient();
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
  const prismaClient = getPrismaClient();
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
  const prismaClient = getPrismaClient();
  return prismaClient.release.findFirst({
    where: { appId },
    orderBy: { version: 'desc' },
  });
}

export async function findLastRelease(appId: string): Promise<ReleaseMeta | null> {
  const prismaClient = getPrismaClient();
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
  const prismaClient = getPrismaClient();
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
  const prismaClient = getPrismaClient();
  return prismaClient.release.findMany({
    where: { appId },
    select: SELECT_RELEASE_META,
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getRelease(appId: string, version: number): Promise<ReleaseMeta | null> {
  const prismaClient = getPrismaClient();
  return prismaClient.release.findUnique({
    where: { release_app_constraint: { appId, version } },
    select: SELECT_RELEASE_META,
  });
}

export type Deployment = prisma.Deployment & {
  release: ReleaseMeta;
};

export function getDeployments(appId: string): Promise<Deployment[]> {
  const prismaClient = getPrismaClient();
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
  const prismaClient = getPrismaClient();
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
  const prismaClient = getPrismaClient();
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

export async function loadDom(): Promise<appDom.AppDom> {
  return loadLocalDom();
}

export async function getConnectionParams<P = unknown>(
  connectionId: string | null,
): Promise<P | null> {
  const dom = await loadDom();
  const node = appDom.getNode(
    dom,
    connectionId as NodeId,
    'connection',
  ) as appDom.ConnectionNode<P>;
  return node.attributes.params.value;
}

export async function setConnectionParams<P>(connectionId: NodeId, params: P): Promise<void> {
  let dom = await loadDom();
  const existing = appDom.getNode(dom, connectionId, 'connection');

  dom = appDom.setNodeNamespacedProp(
    dom,
    existing,
    'attributes',
    'params',
    appDom.createSecret(params),
  );

  await saveDom(dom);
}

export async function execQuery<P, Q>(
  dataNode: appDom.QueryNode<Q>,
  params: Q,
): Promise<ExecFetchResult<any>> {
  const dataSource: ServerDataSource<P, Q, any> | undefined =
    dataNode.attributes.dataSource && serverDataSources[dataNode.attributes.dataSource.value];
  if (!dataSource) {
    throw new Error(
      `Unknown datasource "${dataNode.attributes.dataSource?.value}" for query "${dataNode.id}"`,
    );
  }

  let result = await dataSource.exec(null, dataNode.attributes.query.value, params);

  if (appDom.isQuery(dataNode)) {
    const transformEnabled = dataNode.attributes.transformEnabled?.value;
    const transform = dataNode.attributes.transform?.value;
    if (transformEnabled && transform) {
      const jsServerRuntime = await createServerJsRuntime();
      result = {
        data: await applyTransform(jsServerRuntime, transform, result.data),
      };
    }
  }

  return result;
}

export async function dataSourceFetchPrivate<P, Q>(
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

  return dataSource.execPrivate(null, query);
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

/**
 * Version of loadDom that returns a subset of the dom that doesn't contain sensitive information
 */
export async function loadRuntimeState(): Promise<RuntimeState> {
  return createRuntimeState({ dom: await loadDom() });
}

export async function duplicateApp(id: string, name: string): Promise<AppMeta> {
  const prismaClient = getPrismaClient();
  const dom = await loadPreviewDom(id);
  const appFromDom: CreateAppOptions = {
    from: {
      kind: 'dom',
      dom,
    },
  };
  try {
    const newApp = await createApp(name, appFromDom);
    return newApp;
  } catch (rawError) {
    const error = errorFrom(rawError);
    if (error.code !== ERR_APP_EXISTS) {
      throw error;
    }
    const duplicateCount = await prismaClient.app.count({
      where: { name: { startsWith: `${name} (copy`, endsWith: ')' } },
    });
    const duplicateName =
      duplicateCount === 0 ? `${name} (copy)` : `${name} (copy ${duplicateCount + 1})`;
    const newApp = await createApp(duplicateName, appFromDom);
    return newApp;
  }
}
