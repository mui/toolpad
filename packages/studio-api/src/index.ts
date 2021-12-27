import 'reflect-metadata';
import * as typeorm from 'typeorm';
import { Connection } from './entity/Connection';
import { Page } from './entity/Page';
import { Query } from './entity/Query';

let connectionPromise: Promise<typeorm.Connection>;
export async function getConnection(config: typeorm.ConnectionOptions) {
  const name = 'default';
  if (!connectionPromise) {
    connectionPromise = (async () => {
      // clean up old connection that references outdated hot-reload classes
      try {
        const staleConnection = typeorm.getConnection(name);
        await staleConnection.close();
      } catch (error) {
        if (!(error instanceof typeorm.ConnectionNotFoundError)) {
          throw error;
        }
      }

      // wait for new default connection
      return typeorm.createConnection({
        ...config,
        name,
        synchronize: true,
        logging: false,
        entities: [Page, Connection, Query],
        migrations: [],
        subscribers: [],
      });
    })();
  }
  return connectionPromise;
}

// This is just a test
export function test(config) {
  return getConnection(config)
    .then(async (connection) => {
      console.log('Inserting a new page into the database...');

      const newPage = new Page();
      newPage.id = String(Math.random());
      newPage.pathname = '/';
      newPage.title = 'hello';
      newPage.content = '{}';

      const page = await connection.getRepository(Page).save(newPage);

      console.log(`Saved a new page with id: ${page.id}`);

      console.log('Loading pages from the database...');
      const pages = await connection.getRepository(Page).find();
      console.log('Loaded pages: ', pages);
    })
    .catch((error) => console.error(error));
}
