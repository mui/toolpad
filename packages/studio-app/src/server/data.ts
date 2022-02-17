import * as fs from 'fs/promises';
import * as path from 'path';
import config from './config';
import {
  StudioConnection,
  StudioConnectionSummary,
  ConnectionStatus,
  StudioDataSourceServer,
  StudioApiResult,
  NodeId,
} from '../types';
import studioDataSources from '../studioDataSources/server';
import * as studioDom from '../studioDom';

export const DATA_ROOT = path.resolve(config.dir, './.studio-data');

interface StoredstudioDom extends studioDom.StudioDom {
  id: 'default';
}

interface KindObjectMap {
  app: {
    full: StoredstudioDom;
    summary: StoredstudioDom;
  };
  connection: {
    full: StudioConnection;
    summary: StudioConnectionSummary;
  };
}

type Kind = keyof KindObjectMap;
type FullObject<K extends Kind> = KindObjectMap[K]['full'];
type Updates<O extends { id: string }> = Partial<O> & Pick<O, 'id'>;

function resolveKindPath(unsafeKind: Kind): string {
  const kind = path.normalize(unsafeKind);
  return path.resolve(DATA_ROOT, kind);
}

function resolveObjectPath(kindPath: string, unsafeId: string): string {
  const id = path.normalize(unsafeId);
  const objectPath = path.resolve(kindPath, `${id}.json`);
  return objectPath;
}

async function writeObject<K extends Kind>(kind: K, object: FullObject<K>): Promise<void> {
  const kindDir = resolveKindPath(kind);
  const objectPath = resolveObjectPath(kindDir, object.id);
  await fs.mkdir(kindDir, { recursive: true });
  await fs.writeFile(objectPath, JSON.stringify(object), {
    encoding: 'utf-8',
  });
}

async function getObject<K extends Kind>(kind: K, id: string): Promise<FullObject<K>> {
  const kindDir = resolveKindPath(kind);
  const objectPath = resolveObjectPath(kindDir, id);
  const page = await fs.readFile(objectPath, { encoding: 'utf-8' });
  return JSON.parse(page);
}

function createDefaultApp(): studioDom.StudioDom {
  let dom = studioDom.createDom();
  const page = studioDom.createNode(dom, 'page', {
    name: 'DefaultPage',
    title: 'Default',
    urlQuery: {},
  });
  const app = studioDom.getApp(dom);
  dom = studioDom.addNode(dom, page, app, 'pages');
  return dom;
}

const APP_ID = 'default';

export async function saveApp(app: studioDom.StudioDom): Promise<void> {
  await writeObject('app', {
    id: APP_ID,
    ...app,
  });
}

export async function loadApp(): Promise<studioDom.StudioDom> {
  try {
    const app = await getObject('app', APP_ID);
    return app;
  } catch (err) {
    const app = createDefaultApp();
    await saveApp(app);
    return app;
  }
}

function fromDomConnection<P>(
  domConnection: studioDom.StudioConnectionNode<P>,
): StudioConnection<P> {
  const { dataSource } = domConnection;
  return {
    ...domConnection,
    type: dataSource,
  };
}

export async function getConnections(): Promise<StudioConnection[]> {
  const dom = await loadApp();
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
  const dom = await loadApp();
  const app = studioDom.getApp(dom);
  const newConnection = studioDom.createNode(dom, 'connection', {
    dataSource: type,
    params,
    name,
    status,
  });

  const newDom = studioDom.addNode(dom, newConnection, app, 'connections');
  await saveApp(newDom);

  return fromDomConnection(newConnection);
}

export async function getConnection(id: string): Promise<StudioConnection> {
  const dom = await loadApp();
  return fromDomConnection(studioDom.getNode(dom, id as NodeId, 'connection'));
}

export async function updateConnection({
  id,
  params,
  name,
  status,
  type,
}: Updates<StudioConnection>): Promise<StudioConnection> {
  const dom = await loadApp();
  const existing = studioDom.getNode(dom, id as NodeId, 'connection');
  const updates = { ...existing };
  if (params !== undefined) {
    updates.params = params;
  }
  if (name !== undefined) {
    updates.name = name;
  }
  if (status !== undefined) {
    updates.status = status;
  }
  if (type !== undefined) {
    updates.dataSource = type;
  }
  const newDom = studioDom.saveNode(dom, updates);
  await saveApp(newDom);
  return fromDomConnection(updates);
}

// TODO: replace with testConnection2
export async function testConnection(connection: StudioConnection): Promise<ConnectionStatus> {
  const dataSource = studioDataSources[connection.type];
  if (!dataSource) {
    return { timestamp: Date.now(), error: `Unknown datasource "${connection.type}"` };
  }
  return dataSource.test(connection);
}

export async function testConnection2(
  connection: studioDom.StudioConnectionNode,
): Promise<ConnectionStatus> {
  const dataSource = studioDataSources[connection.dataSource];
  if (!dataSource) {
    return { timestamp: Date.now(), error: `Unknown datasource "${connection.type}"` };
  }
  return dataSource.test(connection);
}

export async function execApi<Q>(
  api: studioDom.StudioApiNode<Q>,
  params: Q,
): Promise<StudioApiResult<any>> {
  const connection = await getConnection(api.connectionId);
  const dataSource: StudioDataSourceServer<any, Q, any> | undefined =
    studioDataSources[connection.type];

  if (!dataSource) {
    throw new Error(
      `Unknown connection type "${connection.type}" for connection "${api.connectionId}"`,
    );
  }

  return dataSource.exec(connection, api.query, params);
}
