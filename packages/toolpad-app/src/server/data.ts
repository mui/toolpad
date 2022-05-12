import { BindableAttrValue } from '@mui/toolpad-core';
import {
  App,
  DomNodeAttributeType,
  PrismaClient,
  Release,
  Prisma,
} from '../../prisma/generated/client';
import {
  LegacyConnection,
  ServerDataSource,
  ApiResult,
  NodeId,
  Updates,
  VersionOrPreview,
  PrivateApiResult,
} from '../types';
import serverDataSources from '../toolpadDataSources/server';
import * as appDom from '../appDom';
import { omit } from '../utils/immutability';
import { asArray } from '../utils/collections';
import { decryptSecret, encryptSecret } from './secrets';
import evalExpression from './evalExpression';

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

function serializeValue(value: unknown, type: DomNodeAttributeType): string {
  const serialized = value === undefined ? '' : JSON.stringify(value);
  return type === 'secret' ? encryptSecret(serialized) : serialized;
}

function deserializeValue(dbValue: string, type: DomNodeAttributeType): unknown {
  const serialized = type === 'secret' ? decryptSecret(dbValue) : dbValue;
  return serialized.length <= 0 ? undefined : JSON.parse(serialized);
}

export async function saveDom(appId: string, app: appDom.AppDom): Promise<void> {
  await prisma.$transaction([
    prisma.domNode.deleteMany({ where: { appId } }),
    prisma.domNode.createMany({
      data: Array.from(Object.values(app.nodes) as appDom.AppDomNode[], (node) => {
        return {
          appId,
          id: node.id,
          name: node.name,
          type: node.type,
          parentId: node.parentId || undefined,
          parentIndex: node.parentIndex || undefined,
          parentProp: node.parentProp || undefined,
        };
      }),
    }),
    prisma.domNodeAttribute.createMany({
      data: Object.values(app.nodes).flatMap((node: appDom.AppDomNode) => {
        const namespaces = omit(node, ...appDom.RESERVED_NODE_PROPERTIES);
        const attributesData = Object.entries(namespaces).flatMap(([namespace, attributes]) => {
          return Object.entries(attributes).map(([attributeName, attributeValue]) => {
            return {
              nodeId: node.id,
              namespace,
              name: attributeName,
              type: attributeValue.type,
              value: serializeValue(attributeValue.value, attributeValue.type),
            };
          });
        });
        return attributesData;
      }),
    }),
  ]);
}

export async function loadDom(appId: string): Promise<appDom.AppDom> {
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

  return {
    root,
    nodes,
  };
}

export async function getApps() {
  return prisma.app.findMany();
}

export async function createApp(name: string): Promise<App> {
  return prisma.$transaction(async () => {
    const app = await prisma.app.create({
      data: { name },
    });

    const dom = appDom.createDom();
    const appNode = appDom.getApp(dom);
    const newNode = appDom.createNode(dom, 'connection', {
      attributes: {
        dataSource: appDom.createConst('rest'),
        params: appDom.createSecret({ name: 'rest' }),
        status: appDom.createConst(null),
      },
    });
    const newDom = await appDom.addNode(dom, newNode, appNode, 'connections');
    await saveDom(app.id, newDom);

    return app;
  });
}

export async function deleteApp(id: string) {
  return prisma.app.delete({
    where: { id },
  });
}

interface CreateReleaseParams {
  description: string;
}

const SELECT_RELEASE_META = excludeFields(Prisma.ReleaseScalarFieldEnum, ['snapshot']);

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
  const currentDom = await loadDom(appId);
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

export async function deleteRelease(appId: string, version: number) {
  return prisma.release.delete({
    where: { release_app_constraint: { appId, version } },
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

function fromDomConnection<P>(domConnection: appDom.ConnectionNode<P>): LegacyConnection<P> {
  const { attributes, id, name } = domConnection;
  return {
    id,
    name,
    type: attributes.dataSource.value,
    params: attributes.params.value,
    status: attributes.status.value,
  };
}

export async function addConnection(
  appId: string,
  { params, name, status, type }: LegacyConnection,
): Promise<LegacyConnection> {
  const dom = await loadDom(appId);
  const app = appDom.getApp(dom);
  const newConnection = appDom.createNode(dom, 'connection', {
    name,
    attributes: {
      dataSource: appDom.createConst(type),
      params: appDom.createSecret(params),
      status: appDom.createConst(status),
    },
  });

  const newDom = appDom.addNode(dom, newConnection, app, 'connections');
  await saveDom(appId, newDom);

  return fromDomConnection(newConnection);
}

export async function getConnection(appId: string, id: string): Promise<LegacyConnection> {
  const dom = await loadDom(appId);
  return fromDomConnection(appDom.getNode(dom, id as NodeId, 'connection'));
}

export async function updateConnection(
  appId: string,
  { id, params, name, status, type }: Updates<LegacyConnection>,
): Promise<LegacyConnection> {
  let dom = await loadDom(appId);
  const existing = appDom.getNode(dom, id as NodeId, 'connection');
  if (name !== undefined) {
    dom = appDom.setNodeName(dom, existing, name);
  }
  if (params !== undefined) {
    dom = appDom.setNodeNamespacedProp(
      dom,
      existing,
      'attributes',
      'params',
      appDom.createSecret(params),
    );
  }
  if (status !== undefined) {
    dom = appDom.setNodeNamespacedProp(
      dom,
      existing,
      'attributes',
      'status',
      appDom.createConst(status),
    );
  }
  if (type !== undefined) {
    dom = appDom.setNodeNamespacedProp(
      dom,
      existing,
      'attributes',
      'dataSource',
      appDom.createConst(type),
    );
  }
  await saveDom(appId, dom);
  return fromDomConnection(appDom.getNode(dom, id as NodeId, 'connection'));
}

export async function execApi<Q>(
  appId: string,
  api: appDom.ApiNode<Q>,
  params: Q,
): Promise<ApiResult<any>> {
  const dataSource: ServerDataSource<any, Q, any> | undefined =
    serverDataSources[api.attributes.dataSource.value];
  if (!dataSource) {
    throw new Error(`Unknown datasource "${api.attributes.dataSource.value}" for api "${api.id}"`);
  }

  const connection = await getConnection(appId, api.attributes.connectionId.value);
  if (!connection) {
    throw new Error(
      `Unknown connection "${api.attributes.connectionId.value}" for api "${api.id}"`,
    );
  }
  if (api.attributes.transformEnabled.value) {
    const apiResult = await dataSource.exec(connection, api.attributes.query.value, params);
    return {
      data: await evalExpression(
        `${api.attributes.transform.value}(${JSON.stringify(apiResult.data)})`,
      ),
    };
  }
  return dataSource.exec(connection, api.attributes.query.value, params);
}

export async function dataSourceFetchPrivate<Q>(
  appId: string,
  connectionId: NodeId,
  query: Q,
): Promise<PrivateApiResult<any>> {
  const connection = await getConnection(appId, connectionId);
  const dataSource: ServerDataSource<any, any, any> | undefined =
    serverDataSources[connection.type];

  if (!dataSource) {
    throw new Error(
      `Unknown connection type "${connection.type}" for connection "${connection.id}"`,
    );
  }

  if (!dataSource.execPrivate) {
    throw new Error(`No execPrivate available on datasource "${connection.type}"`);
  }

  return dataSource.execPrivate(connection, query);
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

export async function loadVersionedDom(appId: string, version: VersionOrPreview) {
  return version === 'preview' ? loadDom(appId) : loadReleaseDom(appId, version);
}
