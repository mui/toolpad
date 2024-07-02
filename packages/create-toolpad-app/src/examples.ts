/**
 * Loosely adapted from
 * https://github.com/vercel/next.js/blob/e2f3059b48a779c2a755c21da26570d251305c01/packages/create-next-app/helpers/examples.ts
 */
import * as path from 'path';
import * as os from 'os';
import chalk from 'chalk';
import * as fs from 'fs/promises';
import { createWriteStream } from 'fs';
import * as tar from 'tar';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import invariant from 'invariant';

async function downloadTar(url: string) {
  const tempFile = path.join(os.tmpdir(), `toolpad-cta-example.temp-${Date.now()}`);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  invariant(response.body, 'Missing response body');

  let current = 0;
  // @ts-expect-error - @types/node ReadableStream clashing with lib.dom ReadableStream
  // https://github.com/microsoft/TypeScript/issues/29867
  const readable = Readable.fromWeb(response.body);
  readable.on('data', (chunk) => {
    process.stdout.write(`Downloading… ${(current / 1000000).toFixed(2)} MBs\r`);
    current += chunk.length;
  });
  await pipeline(readable, createWriteStream(tempFile));

  return tempFile;
}

export async function downloadAndExtractExample(root: string, name: string) {
  // eslint-disable-next-line no-console
  console.log();
  // eslint-disable-next-line no-console
  console.log(`${chalk.cyan('info')} - Downloading example "${name}" to ${chalk.cyan(root)}`);
  // eslint-disable-next-line no-console
  console.log();
  const tempFile = await downloadTar('https://codeload.github.com/mui/mui-toolpad/tar.gz/master');

  await tar.x({
    file: tempFile,
    cwd: root,
    strip: 2 + name.split('/').length,
    filter: (p) => p.includes(`mui-toolpad-master/examples/${name}/`),
  });

  // eslint-disable-next-line no-console
  console.log();
  // eslint-disable-next-line no-console
  console.log(
    `${chalk.green('success')} - Downloaded and extracted "${name}" to ${chalk.cyan(root)}`,
  );
  // eslint-disable-next-line no-console
  console.log();

  await fs.unlink(tempFile);
}
