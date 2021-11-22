import * as fs from 'fs/promises';
import * as path from 'path';
import { createPage } from './studioPage';
import { StudioConnection, StudioConnectionSummary, StudioPage, StudioPageSummary } from './types';
import { generateRandomId } from './utils/randomId';

interface KindObjectMap {
  page: {
    full: StudioPage;
    summary: StudioPageSummary;
  };
  connection: {
    full: StudioConnection;
    summary: StudioConnectionSummary;
  };
}

type Kind = keyof KindObjectMap;
type FullObject<K extends Kind> = KindObjectMap[K]['full'];
type SummaryObject<K extends Kind> = KindObjectMap[K]['summary'];
type SummaryMapper<K extends Kind> = (full: FullObject<K>) => SummaryObject<K>;
interface KindUtil<K extends Kind> {
  mapToSummary: SummaryMapper<K>;
}

const kindUtil: {
  [K in Kind]: KindUtil<K>;
} = {
  page: {
    mapToSummary: ({ id }) => ({ id }),
  },
  connection: {
    mapToSummary: ({ id, type, name }) => ({ id, type, name }),
  },
};

const DATA_ROOT = path.resolve(process.cwd(), './data');

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

async function getObjectIds(kind: Kind): Promise<string[]> {
  const kindDir = resolveKindPath(kind);
  const entries = await fs.readdir(kindDir);
  return entries.flatMap((entry) => (entry.endsWith('.json') ? [entry.slice(0, -5)] : []));
}

async function getObjectSummaries<K extends Kind>(kind: K): Promise<SummaryObject<K>[]> {
  const objects = await getObjects(kind);
  const { mapToSummary } = kindUtil[kind] as unknown as KindUtil<K>;
  return objects.map(mapToSummary);
}

async function getObjects<K extends Kind>(kind: K): Promise<FullObject<K>[]> {
  const objectIds = await getObjectIds(kind);
  return Promise.all(objectIds.map((id) => getObject(kind, id)));
}

async function getObject<K extends Kind>(kind: K, id: string): Promise<FullObject<K>> {
  const kindDir = resolveKindPath(kind);
  const objectPath = resolveObjectPath(kindDir, id);
  const page = await fs.readFile(objectPath, { encoding: 'utf-8' });
  return JSON.parse(page);
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
  object: FullObject<K>,
): Promise<FullObject<K>> {
  if (await objectExists(kind, object.id)) {
    await writeObject(kind, object);
    return object;
  } 
    throw new Error(`Trying to update non-existing ${kind} "${object.id}"`);
  
}

export async function pageExists(id: string): Promise<boolean> {
  return objectExists('page', id);
}

export async function getPages(): Promise<StudioPageSummary[]> {
  return getObjectSummaries('page');
}

export async function addPage(id: string): Promise<StudioPage> {
  return addObject('page', createPage(id));
}

export async function getPage(pageId: string): Promise<StudioPage> {
  return getObject('page', pageId);
}

export async function updatePage(newPage: StudioPage): Promise<StudioPage> {
  return updateObject('page', newPage);
}

export async function getConnections(): Promise<StudioConnection[]> {
  return getObjects('connection');
}

export async function getConnectionSummaries(): Promise<StudioConnectionSummary[]> {
  return getObjectSummaries('connection');
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

export async function updateConnection(connection: StudioConnection): Promise<StudioConnection> {
  return updateObject('connection', connection);
}
