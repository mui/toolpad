import * as fs from 'fs/promises';
import * as path from 'path';
import { DATA_ROOT } from './db';
import {
  StudioConnection,
  StudioConnectionSummary,
  StudioApi,
  ConnectionStatus,
  StudioApiResult,
  StudioApiSummary,
  NodeId,
} from '../types';
import { generateRandomId, generateUniqueId } from '../utils/randomId';
import studioDataSources from '../studioDataSources/server';
import { StudioDom } from '../studioDom';

interface StoredstudioDom extends StudioDom {
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
  api: {
    full: StudioApi;
    summary: StudioApiSummary;
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
  api: {
    mapToSummary: ({ id, name }) => ({ id, name }),
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

export async function getApis(): Promise<StudioApi[]> {
  return getObjects('api');
}

export async function getApiSummaries(): Promise<StudioApiSummary[]> {
  return getObjectSummaries('api');
}

export async function addApi(api: StudioApi): Promise<StudioApi> {
  return addObject('api', api);
}

export async function getApi(id: string): Promise<StudioApi> {
  return getObject('api', id);
}

export async function updateApi(api: Updates<StudioApi>): Promise<StudioApi> {
  return updateObject('api', api);
}

export async function execApi(api: StudioApi): Promise<StudioApiResult<any>> {
  const connection = await getConnection(api.connectionId);
  const dataSource = studioDataSources[connection.type];
  if (!dataSource) {
    throw new Error(
      `Unknown connection type "${connection.type}" for connection "${api.connectionId}"`,
    );
  }
  return dataSource.exec(connection, api.query);
}

const DEFAULT_THEME_CONTENT = `
import { createTheme } from '@mui/material/styles';
import { green, orange } from '@mui/material/colors';

export default createTheme({
  palette: {
    primary: {
      main: orange[500],
    },
    secondary: {
      main: green[500],
    },
  },
});
`;

function createDefaultApp(): StudioDom {
  const ids = new Set<NodeId>();
  const appId = generateUniqueId(ids) as NodeId;
  ids.add(appId);
  const themeId = generateUniqueId(ids) as NodeId;
  ids.add(themeId);
  const pageId = generateUniqueId(ids) as NodeId;
  ids.add(pageId);
  const rootId = generateUniqueId(ids) as NodeId;
  ids.add(rootId);
  const stackId = generateUniqueId(ids) as NodeId;
  ids.add(stackId);
  const buttonId = generateUniqueId(ids) as NodeId;
  ids.add(buttonId);
  return {
    nodes: {
      [appId]: {
        id: appId,
        type: 'app',
        name: 'App',
        parentId: null,
        apis: [],
        pages: [pageId],
        theme: themeId,
      },
      [themeId]: {
        id: themeId,
        type: 'theme',
        name: 'Theme',
        parentId: appId,
        content: DEFAULT_THEME_CONTENT,
      },
      [pageId]: {
        id: pageId,
        type: 'page',
        name: 'DefaultPage',
        parentId: appId,
        title: 'Default',
        root: rootId,
        state: {},
      },
      [rootId]: {
        id: rootId,
        type: 'element',
        name: 'Page',
        parentId: pageId,
        component: 'Page',
        children: [stackId],
        props: {},
      },
      [stackId]: {
        id: stackId,
        type: 'element',
        name: 'Stack',
        parentId: rootId,
        component: 'Stack',
        children: [buttonId],
        props: {},
      },
      [buttonId]: {
        id: buttonId,
        type: 'element',
        name: 'Button',
        parentId: stackId,
        component: 'Button',
        children: [],
        props: { children: { type: 'const', value: 'Hello' } },
      },
    },
    root: appId,
  };
}

export async function loadApp(): Promise<StudioDom> {
  try {
    const app = await getObject('app', 'default');
    return app;
  } catch (err) {
    return createDefaultApp();
  }
}

export async function saveApp(app: StudioDom): Promise<void> {
  await writeObject('app', {
    id: 'default',
    ...app,
  });
}
