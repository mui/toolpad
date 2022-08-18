import execa from 'execa';
import * as path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

const DEV_COMPOSE_FILE = path.resolve(__dirname, '../../docker-compose.dev.yml');

/**
 * Test whether the dev database is running
 */
export async function isRunning(): Promise<boolean> {
  const { stdout } = await execa('docker', [
    'compose',
    `-f=${DEV_COMPOSE_FILE}`,
    'ps',
    '--format=json',
    'postgres',
  ]);
  const [service] = JSON.parse(stdout);
  return service?.State === 'running';
}

/**
 * Backup the dev database
 */
export async function dump(): Promise<string> {
  const { stdout } = await execa('docker', [
    'compose',
    `-f=${DEV_COMPOSE_FILE}`,
    'exec',
    'postgres',
    'pg_dump',
    '-U',
    'postgres',
  ]);

  return stdout;
}

/**
 * Restore the dev database from backup
 */
export async function restore(pgDump: string): Promise<void> {
  const { stdin } = execa('docker', [
    'compose',
    `-f=${DEV_COMPOSE_FILE}`,
    'exec',
    'postgres',
    'pg_restore',
    '-U',
    'postgres',
  ]);
  if (!stdin) {
    throw new Error(`childprocess was spawned with stdio[0] !== 'pipe'`);
  }
  await pipeline(Readable.from([pgDump]), stdin);
}
