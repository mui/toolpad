import { DomNodeAttributeType, PrismaClient, Release } from '../../prisma/generated/client';
import {
  StudioConnection,
  ConnectionStatus,
  StudioDataSourceServer,
  StudioApiResult,
  NodeId,
  StudioBindable,
  Updates,
  VersionOrPreview,
} from '../types';
import studioDataSources from '../studioDataSources/server';
import * as appDom from '../appDom';
import { omit } from '../utils/immutability';
import { asArray } from '../utils/collections';
import { decryptSecret, encryptSecret } from './secrets';

const prisma = new PrismaClient();

export async function getApps() {
  return prisma.app.findMany();
}

export async function createApp(name: string) {
  return prisma.app.create({
    data: { name },
  });
}

export async function deleteApp(id: string) {
  return prisma.app.delete({
    where: { id },
  });
}

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
  if (dbNodes.length <= 0) {
    const dom = appDom.createDom();
    await saveDom(appId, dom);
    return dom;
  }
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
            } as StudioBindable<unknown>;
            return result;
          }, {} as Record<string, Record<string, StudioBindable<unknown>>>),
        } as appDom.AppDomNode,
      ];
    }),
  );

  return {
    root,
    nodes,
  };
}

interface CreateReleaseParams {
  description: string;
}

const SELECT_RELEASE_META = {
  version: true,
  description: true,
  createdAt: true,
} as const;

export function findLastRelease(appId: string) {
  return prisma.release.findFirst({
    where: { appId },
    orderBy: { version: 'desc' },
  });
}

export async function createRelease(
  appId: string,
  { description }: CreateReleaseParams,
): Promise<Pick<Release, keyof typeof SELECT_RELEASE_META>> {
  const currentDom = await loadDom(appId);
  const snapshot = Buffer.from(JSON.stringify(currentDom), 'utf-8');

  const lastRelease = await findLastRelease(appId);
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

function fromDomConnection<P>(domConnection: appDom.ConnectionNode<P>): StudioConnection<P> {
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
  { params, name, status, type }: StudioConnection,
): Promise<StudioConnection> {
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

export async function getConnection(appId: string, id: string): Promise<StudioConnection> {
  const dom = await loadDom(appId);
  return fromDomConnection(appDom.getNode(dom, id as NodeId, 'connection'));
}

export async function updateConnection(
  appId: string,
  { id, params, name, status, type }: Updates<StudioConnection>,
): Promise<StudioConnection> {
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

export async function testConnection(connection: appDom.ConnectionNode): Promise<ConnectionStatus> {
  const dataSource = studioDataSources[connection.attributes.dataSource.value];
  if (!dataSource) {
    return { timestamp: Date.now(), error: `Unknown datasource "${connection.type}"` };
  }
  return dataSource.test(fromDomConnection(connection));
}

export async function execApi<Q>(
  appId: string,
  api: appDom.ApiNode<Q>,
  params: Q,
): Promise<StudioApiResult<any>> {
  const dataSource: StudioDataSourceServer<any, Q, any> | undefined =
    studioDataSources[api.attributes.dataSource.value];
  if (!dataSource) {
    throw new Error(`Unknown datasource "${api.attributes.dataSource.value}" for api "${api.id}"`);
  }

  const connection = await getConnection(appId, api.attributes.connectionId.value);
  if (!connection) {
    throw new Error(
      `Unknown connection "${api.attributes.connectionId.value}" for api "${api.id}"`,
    );
  }

  return dataSource.exec(connection, api.attributes.query.value, params);
}

export async function dataSourceFetchPrivate(
  appId: string,
  connectionId: NodeId,
  query: any,
): Promise<any> {
  const connection = await getConnection(appId, connectionId);
  const dataSource: StudioDataSourceServer<any, any, any> | undefined =
    studioDataSources[connection.type];

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
