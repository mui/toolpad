import 'reflect-metadata';
import * as typeorm from 'typeorm';
import * as path from 'path';
import { Page, PageEntity } from '../entity/Page';
import config from './config';

// TODO: move to server constants file?
export const DATA_ROOT = path.resolve(config.dir, './.studio-data');

let connectionPromise: Promise<typeorm.Connection>;
async function getConnection() {
  if (!connectionPromise) {
    connectionPromise = (async () => {
      // clean up old connection that references outdated hot-reload classes
      try {
        const staleConnection = typeorm.getConnection();
        await staleConnection.close();
      } catch (error) {
        if (!(error instanceof typeorm.ConnectionNotFoundError)) {
          throw error;
        }
      }

      // wait for new default connection
      return typeorm.createConnection({
        type: 'sqlite',
        database: path.resolve(DATA_ROOT, 'database.sqlite'),
        synchronize: true,
        logging: false,
        entities: [PageEntity],
        migrations: [],
        subscribers: [],
      });
    })();
  }
  return connectionPromise;
}

// This is just a test
getConnection()
  .then(async (connection) => {
    console.log('Inserting a new page into the database...');

    const page = await connection.getRepository<Page>(PageEntity).save({
      name: 'Timber',
      content: '{}',
    });

    console.log(`Saved a new page with id: ${page.id}`);

    console.log('Loading pages from the database...');
    const pages = await connection.getRepository<Page>(PageEntity).find();
    console.log('Loaded pages: ', pages);
  })
  .catch((error) => console.error(error));
