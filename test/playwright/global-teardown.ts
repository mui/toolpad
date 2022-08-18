import * as devDb from '../utils/devDb';

async function globalTeardown() {
  // eslint-disable-next-line no-underscore-dangle
  const pgDump = (globalThis as any).__toolpadTestDbDump;

  if (pgDump) {
    // eslint-disable-next-line no-console
    console.log('Restoring the dev database');

    await devDb.restore(pgDump);
  } else if (pgDump !== null) {
    throw new Error(`global-setup didn't run correctly`);
  }
}

export default globalTeardown;
