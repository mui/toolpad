const yargs = require('yargs');
const inquirer = require('inquirer');
const semver = require('semver');

const IMAGE_NAME = 'muicom/toolpad';
const LATEST_TAG = 'latest';

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

async function showFile(commit, file) {
  const { execa } = await import('execa');
  const { exitCode, stderr, stdout } = await execa('git', ['show', `${commit}:${file}`]);
  if (exitCode !== 0) {
    throw new Error(stderr);
  }
  return stdout;
}

async function main({ yes, force, commit, releaseTag }) {
  const { default: chalk } = await import('chalk');

  if (!commit) {
    const log = await commitLog();
    const answers = await inquirer.prompt([
      {
        name: 'commit',
        message: 'Which commit contains the release?',
        type: 'list',
        choices: log.map((entry) => ({
          value: entry.commit,
          name: `${chalk.blue(entry.commit)} ${entry.subject}`,
        })),
        pageSize: 20,
      },
    ]);

    commit = answers.commit;
  }

  if (!releaseTag) {
    const lernaJson = JSON.parse(await showFile(commit, 'lerna.json'));

    const answers = await inquirer.prompt([
      {
        name: 'releaseTag',
        message: 'Which tag will this be release under?',
        type: 'input',
        default: lernaJson.version,
      },
    ]);

    releaseTag = answers.releaseTag;
  }

  const parsedVersion = semver.parse(releaseTag);
  const isPrerelease = parsedVersion.prerelease.length > 0;

  const tags = [releaseTag];

  if (!isPrerelease) {
    tags.push(LATEST_TAG);
  }

  if (!yes) {
    const imagesToBePublished = tags.map((tag) => `${IMAGE_NAME}:${tag}`);
    const answers = await inquirer.prompt([
      {
        name: 'confirmed',
        message: `Docker image ${chalk.blue(
          `${IMAGE_NAME}:${commit}`,
        )} will be published as \n${imagesToBePublished
          .map((image) => `  - ${chalk.blue(image)}`)
          .join('\n')}`,
        type: 'confirm',
      },
    ]);

    if (!answers.confirmed) {
      // eslint-disable-next-line no-console
      console.log(`Canceled`);
      return;
    }
  }

  const exists = await checkTagExists(IMAGE_NAME, releaseTag);
  if (exists && !force) {
    console.error(`Tag "${IMAGE_NAME}:${releaseTag}" already exists`);
    yargs.exit(1, `Tag "${IMAGE_NAME}:${releaseTag}" already exists`);
    return;
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
        })
        .option('releaseTag', {
          describe: 'The tag under which to release this image e.g. v1.2.3',
          type: 'string',
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
