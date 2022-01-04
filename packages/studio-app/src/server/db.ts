import 'reflect-metadata';
import * as typeorm from 'typeorm';
import * as path from 'path';
import config from '../config';
import { Connection, ConnectionEntity } from './entities/Connection';
import { ApiEntity } from './entities/Api';

export const DATA_ROOT = path.resolve(config.dir, './.studio-data');

const entities = [ConnectionEntity, ApiEntity];

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

const SUMMARY_FIELDS = ['id'] as const;

export async function getStudioConnections(): Promise<
  Pick<Connection, typeof SUMMARY_FIELDS[number]>[]
> {
  const connection = await getConnection();
  const connectionRepository = connection.getRepository<Connection>(ConnectionEntity);
  return connectionRepository.find({ select: [...SUMMARY_FIELDS] });
}

export async function getStudioConnection(id: string) {
  const connection = await getConnection();
  const connectionRepository = connection.getRepository<Connection>(ConnectionEntity);
  await connectionRepository.findOneOrFail({ id });
}

export async function saveStudioConnection(conn: Connection) {
  const connection = await getConnection();
  const connectionRepository = connection.getRepository<Connection>(ConnectionEntity);
  return connectionRepository.save(conn);
}
