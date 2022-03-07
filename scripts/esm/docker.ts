import { execa } from 'execa';
import semver from 'semver';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import * as path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const DOCKER_IMAGE_NAME = 'janpot/mui-studio';
const lernaJsonPath = path.resolve(fileURLToPath(import.meta.url), '../../../lerna.json');

async function getVersion() {
  const { version } = JSON.parse(await readFile(lernaJsonPath, 'utf-8'));
  const prerelease = semver.prerelease(version);
  const distTag = prerelease ? 'alpha' : 'latest';
  return { version, distTag };
}

async function build() {
  const { version, distTag } = await getVersion();

  await execa(
    'docker',
    [
      'build',
      '-t',
      `${DOCKER_IMAGE_NAME}:${version}`,
      '-t',
      `${DOCKER_IMAGE_NAME}:${distTag}`,
      '--build-arg',
      `VERSION=${version}`,
      './docker/images/studio',
    ],
    {
      stdio: 'inherit',
    },
  );
}

async function push(tag: string) {
  await execa('docker', ['push', `${DOCKER_IMAGE_NAME}:${tag}`], {
    stdio: 'inherit',
  });
}

async function publish() {
  const { version, distTag } = await getVersion();
  await push(version);
  await push(distTag);
}

yargs(hideBin(process.argv))
  .command({
    command: 'build',
    description: 'build studio docker image',
    handler: build,
  })
  .command({
    command: 'publish',
    description: 'publish studio docker image',
    handler: publish,
  })
  .help()
  .demandCommand(1)
  .strict(true)
  .version(false)
  .parse();
