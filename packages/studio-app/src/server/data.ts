import * as fs from 'fs/promises';
import * as path from 'path';
import { DATA_ROOT } from './db';
import {
  StudioConnection,
  StudioConnectionSummary,
  ConnectionStatus,
  StudioDataSourceServer,
  StudioApiResult,
} from '../types';
import { generateRandomId } from '../utils/randomId';
import studioDataSources from '../studioDataSources/server';
import * as studioDom from '@studioDom';

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
type SummaryObject<K extends Kind> = KindObjectMap[K]['summary'];
type SummaryMapper<K extends Kind> = (full: FullObject<K>) => SummaryObject<K>;
interface KindUtil<K extends Kind> {
  mapToSummary: SummaryMapper<K>;
}

const kindUtil: {
  [K in Kind]: KindUtil<K>;
} = {
  app: {
    mapToSummary: (app) => app,
  },
  connection: {
    mapToSummary: ({ id, type, name }) => ({ id, type, name }),
  },
};

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

async function objectExists(kind: Kind, id: string): Promise<boolean> {
  const kindDir = resolveKindPath(kind);
  const objectPath = resolveObjectPath(kindDir, id);
  try {
    await fs.stat(objectPath);
    return true;
  } catch (err) {
    return false;
  }
}

async function readDirRecursive(dir: string): Promise<string[]> {
  try {
    return await fs.readdir(dir);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

async function getObjectIds(kind: Kind): Promise<string[]> {
  const kindDir = resolveKindPath(kind);
  const entries = await readDirRecursive(kindDir);
  return entries.flatMap((entry) => (entry.endsWith('.json') ? [entry.slice(0, -5)] : []));
}

async function getObject<K extends Kind>(kind: K, id: string): Promise<FullObject<K>> {
  const kindDir = resolveKindPath(kind);
  const objectPath = resolveObjectPath(kindDir, id);
  const page = await fs.readFile(objectPath, { encoding: 'utf-8' });
  return JSON.parse(page);
}

async function getObjects<K extends Kind>(kind: K): Promise<FullObject<K>[]> {
  const objectIds = await getObjectIds(kind);
  return Promise.all(objectIds.map((id) => getObject(kind, id)));
}

async function getObjectSummaries<K extends Kind>(kind: K): Promise<SummaryObject<K>[]> {
  const objects = await getObjects(kind);
  const { mapToSummary } = kindUtil[kind] as unknown as KindUtil<K>;
  return objects.map(mapToSummary);
}

async function addObject<K extends Kind>(kind: K, object: FullObject<K>): Promise<FullObject<K>> {
  if (await objectExists(kind, object.id)) {
    throw new Error(`Trying to add ${kind} "${object.id}" but it already exists`);
  } else {
    await writeObject(kind, object);
    return object;
  }
}

async function updateObject<K extends Kind>(
  kind: K,
  object: Updates<FullObject<K>>,
): Promise<FullObject<K>> {
  const existing = await getObject(kind, object.id);
  if (existing) {
    const updated = {
      ...existing,
      ...object,
    };
    await writeObject(kind, updated);
    return updated;
  }
  throw new Error(`Trying to update non-existing ${kind} "${object.id}"`);
}

export async function getConnections(): Promise<StudioConnection[]> {
  return getObjects('connection');
}

export async function getConnectionSummaries(): Promise<StudioConnectionSummary[]> {
  return getObjectSummaries('connection');
}

export async function testConnection(connection: StudioConnection): Promise<ConnectionStatus> {
  const dataSource = studioDataSources[connection.type];
  if (!dataSource) {
    return { timestamp: Date.now(), error: `Unknown datasource "${connection.type}"` };
  }
  return dataSource.test(connection);
}

export async function addConnection(connection: StudioConnection): Promise<StudioConnection> {
  return addObject('connection', {
    ...connection,
    id: generateRandomId(),
  });
}
export async function getConnection(id: string): Promise<StudioConnection> {
  return getObject('connection', id);
}

export async function updateConnection(
  connection: Updates<StudioConnection>,
): Promise<StudioConnection> {
  return updateObject('connection', connection);
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
