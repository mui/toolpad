import 'reflect-metadata';
import * as typeorm from 'typeorm';
import * as path from 'path';
import config from '../config';
import { ConnectionEntity } from './entities/Connection';
import { Page, PageEntity } from './entities/Page';
import { QueryEntity } from './entities/Query';

export const DATA_ROOT = path.resolve(config.dir, './.studio-data');

const entities = [PageEntity, ConnectionEntity, QueryEntity];

const connectionOptions: typeorm.ConnectionOptions = {
  name: 'default',
  type: 'sqlite',
  database: path.resolve(DATA_ROOT, 'database.sqlite'),
  synchronize: true,
  logging: false,
  entities,
  migrations: [],
  subscribers: [],
};

let connectionPromise: Promise<typeorm.Connection>;
export async function getConnection() {
  const name = 'default';
  if (!connectionPromise) {
    connectionPromise = (async () => {
      // clean up old connection that references outdated hot-reload classes
      try {
        const staleConnection = typeorm.getConnection(name);
        await staleConnection.close();
      } catch (error) {
        // ignore
      }

      // wait for new default connection
      return typeorm.createConnection(connectionOptions);
    })();
  }
  return connectionPromise;
}

const SUMMARY_FIELDS = ['id', 'pathname', 'title'] as const;

export async function getPages(): Promise<Pick<Page, typeof SUMMARY_FIELDS[number]>[]> {
  const connection = await getConnection();
  const pagerepository = connection.getRepository<Page>(PageEntity);
  return pagerepository.find({ select: [...SUMMARY_FIELDS] });
}

export async function getPage(id: string) {
  const connection = await getConnection();
  const pagerepository = connection.getRepository<Page>(PageEntity);
  await pagerepository.findOneOrFail({ id });
}

export async function getPageByPath(pathname: string) {
  const connection = await getConnection();
  const pagerepository = connection.getRepository<Page>(PageEntity);
  await pagerepository.findOneOrFail({ pathname });
}

export async function savePage(page: Page) {
  const connection = await getConnection();
  const pagerepository = connection.getRepository<Page>(PageEntity);
  return pagerepository.save(page);
}
