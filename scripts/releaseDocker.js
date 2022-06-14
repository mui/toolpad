const yargs = require('yargs');

const IMAGE_NAME = 'muicom/toolpad';

async function checkTagExists(image, tag) {
  const { execa } = await import('execa');
  const { exitCode } = await execa('docker', ['manifest', 'inspect', `${image}:${tag}`]);
  return exitCode === 0;
}

async function dockerCreateTag(image, srcTag, destTags) {
  const { execa } = await import('execa');
  const { exitCode, stderr } = await execa(
    'docker',
    [
      'buildx',
      'imagetools',
      'create',
      `${image}:${srcTag}`,
      ...destTags.flatMap((tag) => ['--tag', `${image}:${tag}`]),
    ],
    { stdio: 'inherit' },
  );
  if (exitCode !== 0) {
    throw new Error(stderr);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function commitLog(count = 100) {
  const { execa } = await import('execa');
  const { exitCode, stderr, stdout } = await execa('git', ['log', `-${count}`, `--pretty=oneline`]);
  if (exitCode !== 0) {
    throw new Error(stderr);
  }
  return stdout.split('\n').map((line) => {
    const splitter = line.indexOf(' ');
    return {
      commit: line.slice(0, splitter),
      subject: line.slice(splitter + 1),
    };
  });
}

async function main({ commit, releaseTag, prerelease }) {
  // TODO: if no --commit provided, assume last commit and ask for confirmation
  // TODO: if no --releaseTag provided, read it from the --commit and ask for confirmation

  if (await checkTagExists(IMAGE_NAME, releaseTag)) {
    throw new Error(`Tag "${IMAGE_NAME}:${releaseTag}" already exists`);
  }

  const tags = [releaseTag];

  if (!prerelease) {
    tags.push('latest-test');
  }

  await dockerCreateTag(IMAGE_NAME, commit, tags);
}

yargs
  .command({
    command: '$0',
    description: 'Creates a Docker release',
    builder: (command) => {
      return command
        .option('commit', {
          describe: 'The git commit hash e.g. ff5a591140cce65833d536009c64d1147c3aba44',
          type: 'string',
          demandOption: true,
        })
        .option('releaseTag', {
          describe: 'The tag under which to release this image e.g. v1.2.3',
          type: 'string',
          demandOption: true,
        })
        .option('prerelease', {
          describe: 'Mark as a prerelease (omits the "latest" tag)',
          type: 'boolean',
          default: false,
        })
        .option('force', {
          describe: 'Create tag, even if it already exists',
          type: 'boolean',
          default: false,
        });
    },
    handler: main,
  })
  .help()
  .strict(true)
  .version(false)
  .parse();
