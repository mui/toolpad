import { PrismaClient } from '../../prisma/generated/client';
import config from './config';
import {
  StudioConnection,
  StudioConnectionSummary,
  ConnectionStatus,
  StudioDataSourceServer,
  StudioApiResult,
  NodeId,
  StudioBindable,
} from '../types';
import studioDataSources from '../studioDataSources/server';
import * as studioDom from '../studioDom';
import { omit } from '../utils/immutability';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.databaseUrl,
    },
  },
});

type Updates<O extends { id: string }> = Partial<O> & Pick<O, 'id'>;

function createDefaultApp(): studioDom.StudioDom {
  let dom = studioDom.createDom();
  const page = studioDom.createNode(dom, 'page', {
    name: 'DefaultPage',
    attributes: {
      title: studioDom.createConst('Default'),
      urlQuery: studioDom.createConst({}),
    },
  });
  const app = studioDom.getApp(dom);
  dom = studioDom.addNode(dom, page, app, 'pages');
  return dom;
}

function serializeValue(value: unknown): string {
  return value === undefined ? '' : JSON.stringify(value);
}

function deserializeValue(dbValue: string): unknown {
  return dbValue.length <= 0 ? undefined : JSON.parse(dbValue);
}

export async function saveDom(app: studioDom.StudioDom): Promise<void> {
  await prisma.$transaction([
    prisma.domNodeAttribute.deleteMany(),
    prisma.domNode.deleteMany(),
    prisma.domNode.createMany({
      data: Array.from(Object.values(app.nodes) as studioDom.StudioNode[], (node) => {
        return {
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
      data: Object.values(app.nodes).flatMap((node: studioDom.StudioNode) => {
        const namespaces = omit(node, ...studioDom.RESERVED_NODE_PROPERTIES);
        const attributesData = Object.entries(namespaces).flatMap(([namespace, attributes]) => {
          return Object.entries(attributes).map(([attributeName, attributeValue]) => {
            return {
              nodeId: node.id,
              namespace,
              name: attributeName,
              type: attributeValue.type,
              value: serializeValue(attributeValue.value),
            };
          });
        });
        return attributesData;
      }),
    }),
  ]);
}

export async function loadDom(): Promise<studioDom.StudioDom> {
  const dbNodes = await prisma.domNode.findMany({
    include: { attributes: true },
  });
  if (dbNodes.length <= 0) {
    const app = createDefaultApp();
    await saveDom(app);
    return app;
  }
  const root = dbNodes.find((node) => !node.parentId)?.id as NodeId;
  const nodes = Object.fromEntries(
    dbNodes.map((node): [NodeId, studioDom.StudioNode] => {
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
              value: deserializeValue(attribute.value),
            } as StudioBindable<unknown>;
            return result;
          }, {} as Record<string, Record<string, StudioBindable<unknown>>>),
        } as studioDom.StudioNode,
      ];
    }),
  );

  return {
    root,
    nodes,
  };
}

function fromDomConnection<P>(
  domConnection: studioDom.StudioConnectionNode<P>,
): StudioConnection<P> {
  const { attributes, id, name } = domConnection;
  return {
    id,
    name,
    type: attributes.dataSource.value,
    params: attributes.params.value,
    status: attributes.status.value,
  };
}

export async function getConnections(): Promise<StudioConnection[]> {
  const dom = await loadDom();
  const app = studioDom.getApp(dom);
  const { connections = [] } = studioDom.getChildNodes(dom, app);
  return connections.map(fromDomConnection);
}

export async function getConnectionSummaries(): Promise<StudioConnectionSummary[]> {
  const connections = await getConnections();
  return connections;
}

export async function addConnection({
  params,
  name,
  status,
  type,
}: StudioConnection): Promise<StudioConnection> {
  const dom = await loadDom();
  const app = studioDom.getApp(dom);
  const newConnection = studioDom.createNode(dom, 'connection', {
    name,
    attributes: {
      dataSource: studioDom.createConst(type),
      params: studioDom.createConst(params),
      status: studioDom.createConst(status),
    },
  });

  const newDom = studioDom.addNode(dom, newConnection, app, 'connections');
  await saveDom(newDom);

  return fromDomConnection(newConnection);
}

export async function getConnection(id: string): Promise<StudioConnection> {
  const dom = await loadDom();
  return fromDomConnection(studioDom.getNode(dom, id as NodeId, 'connection'));
}

export async function updateConnection({
  id,
  params,
  name,
  status,
  type,
}: Updates<StudioConnection>): Promise<StudioConnection> {
  let dom = await loadDom();
  const existing = studioDom.getNode(dom, id as NodeId, 'connection');
  if (name !== undefined) {
    dom = studioDom.setNodeName(dom, existing, name);
  }
  if (params !== undefined) {
    dom = studioDom.setNodeNamespacedProp(
      dom,
      existing,
      'attributes',
      'params',
      studioDom.createConst(params),
    );
  }
  if (status !== undefined) {
    dom = studioDom.setNodeNamespacedProp(
      dom,
      existing,
      'attributes',
      'status',
      studioDom.createConst(status),
    );
  }
  if (type !== undefined) {
    dom = studioDom.setNodeNamespacedProp(
      dom,
      existing,
      'attributes',
      'dataSource',
      studioDom.createConst(type),
    );
  }
  await saveDom(dom);
  return fromDomConnection(studioDom.getNode(dom, id as NodeId, 'connection'));
}

export async function testConnection(
  connection: studioDom.StudioConnectionNode,
): Promise<ConnectionStatus> {
  const dataSource = studioDataSources[connection.attributes.dataSource.value];
  if (!dataSource) {
    return { timestamp: Date.now(), error: `Unknown datasource "${connection.type}"` };
  }
  return dataSource.test(fromDomConnection(connection));
}

export async function execApi<Q>(
  api: studioDom.StudioApiNode<Q>,
  params: Q,
): Promise<StudioApiResult<any>> {
  const connection = await getConnection(api.attributes.connectionId.value);
  const dataSource: StudioDataSourceServer<any, Q, any> | undefined =
    studioDataSources[connection.type];

  if (!dataSource) {
    throw new Error(
      `Unknown connection type "${connection.type}" for connection "${connection.id}"`,
    );
  }

  return dataSource.exec(connection, api.attributes.query.value, params);
}
