import * as devDb from '../utils/devDb';

async function globalSetup() {
  // eslint-disable-next-line no-underscore-dangle
  (globalThis as any).__toolpadTestDbDump = null;

  if (!(await devDb.isRunning())) {
    return;
  }

  // eslint-disable-next-line no-console
  console.log('Creating a backup of the dev database');

  // eslint-disable-next-line no-underscore-dangle
  (globalThis as any).__toolpadTestDbDump = await devDb.dump();
}

export default globalSetup;
