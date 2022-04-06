import { execa } from 'execa';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const DOCKER_IMAGE_NAME = 'muicom/toolpad';

async function getVersion(): Promise<string> {
  const result = await execa('git', ['rev-parse', 'HEAD']);
  return result.stdout;
}

async function build(): Promise<void> {
  const version = await getVersion();

  await execa(
    'docker',
    [
      'build',
      '-t',
      `${DOCKER_IMAGE_NAME}:${version}`,
      '-f',
      './docker/images/toolpad/Dockerfile',
      '.',
    ],
    {
      stdio: 'inherit',
    },
  );
}

async function push(tag: string): Promise<void> {
  await execa('docker', ['push', `${DOCKER_IMAGE_NAME}:${tag}`], {
    stdio: 'inherit',
  });
}

async function publish() {
  const version = await getVersion();
  await push(version);
}

yargs(hideBin(process.argv))
  .command({
    command: 'build',
    describe: 'build Toolpad docker image',
    handler: build,
  })
  .command({
    command: 'publish',
    describe: 'publish Toolpad docker image',
    handler: publish,
  })
  .help()
  .demandCommand(1)
  .strict(true)
  .version(false)
  .parse();
