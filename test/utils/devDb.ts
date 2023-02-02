import * as path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import childProcess from 'child_process';
import { promisify } from 'util';

const exec = promisify(childProcess.exec);

const DEV_COMPOSE_FILE = path.resolve(__dirname, '../../docker-compose.dev.yml');

/**
 * Test whether the dev database is running
 */
export async function isRunning(): Promise<boolean> {
  try {
    const { stdout } = await exec(
      `docker-compose -f ${DEV_COMPOSE_FILE} ps --format=json postgres`,
    );
    const [service] = JSON.parse(stdout);
    return service?.State === 'running';
  } catch {
    return false;
  }
}

/**
 * Backup the dev database
 */
export async function dump(): Promise<Buffer> {
  const proc = exec(
    `docker-compose -f ${DEV_COMPOSE_FILE} exec postgres pg_dump -U postgres --format t`,
    { encoding: 'buffer' },
  );

  if (!proc.child.stdout) {
    throw new Error(`childprocess was spawned with stdio[1] !== 'pipe'`);
  }

  const buffers = [];
  for await (const data of proc.child.stdout) {
    buffers.push(data);
  }

  await proc;

  return Buffer.concat(buffers);
}

/**
 * Restore the dev database from backup
 */
export async function restore(pgDump: string): Promise<void> {
  const proc = exec(
    `docker-compose -f ${DEV_COMPOSE_FILE} exec postgres pg_restore -U postgres -d postgres --clean`,
  );

  if (!proc.child.stdin) {
    throw new Error(`childprocess was spawned with stdio[0] !== 'pipe'`);
  }
  await pipeline(Readable.from([pgDump]), proc.child.stdin);
  await proc;
}
