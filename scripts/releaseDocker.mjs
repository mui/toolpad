import inquirer from 'inquirer';
import { execa } from 'execa';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import semver from 'semver';

const IMAGE_NAME = 'muicom/toolpad';
const LATEST_TAG = 'latest';

async function checkTagExists(image, tag) {
  try {
    const { exitCode } = await execa('docker', ['manifest', 'inspect', `${image}:${tag}`]);
    return exitCode === 0;
  } catch (err) {
    const { stderr } = err;
    if (stderr === `no such manifest: docker.io/${image}:${tag}`) {
      return false;
    }
    throw err;
  }
}

async function dockerCreateTag(image, srcTag, destTags) {
  const srImage = `${image}:${srcTag}`;
  try {
    await execa('docker', ['pull', srImage], { stdio: 'inherit' });
    await Promise.all(
      destTags.map(async (destTag) => {
        const destImage = `${image}:${destTag}`;
        await execa('docker', ['tag', srImage, destImage], { stdio: 'inherit' });
        await execa('docker', ['push', destImage], { stdio: 'inherit' });
      }),
    );
  } finally {
    await execa('docker', ['rmi', srImage], { stdio: 'inherit' });
  }
}

async function commitLog(count = 100) {
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
  const { exitCode, stderr, stdout } = await execa('git', ['show', `${commit}:${file}`]);
  if (exitCode !== 0) {
    throw new Error(stderr);
  }
  return stdout;
}

async function currentBranch() {
  const { stdout } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  return stdout;
}

async function main({ yes, force, commit, releaseTag, 'no-latest': noLatest }) {
  if (!commit) {
    const branch = await currentBranch();
    if (branch !== 'master') {
      const { branchConfirmed } = await inquirer.prompt([
        {
          name: 'branchConfirmed',
          type: 'confirm',
          message: `Current branch is ${chalk.blue(branch)}. Are you sure you want to proceed?`,
          default: false,
        },
      ]);

      if (!branchConfirmed) {
        yargs.exit();
      }
    }
    const answers = await inquirer.prompt([
      {
        name: 'commit',
        message: 'Which commit contains the release?',
        type: 'list',
        async choices() {
          const log = await commitLog();
          return log.map((entry) => ({
            value: entry.commit,
            name: `${chalk.blue(entry.commit)} ${entry.subject}`,
          }));
        },
        pageSize: 20,
      },
    ]);

    commit = answers.commit;
  }

  if (!releaseTag) {
    const answers = await inquirer.prompt([
      {
        name: 'releaseTag',
        message: 'Which tag will this be release under?',
        type: 'input',
        async default() {
          const lernaJson = JSON.parse(await showFile(commit, 'lerna.json'));
          return `v${lernaJson.version}`;
        },
      },
    ]);

    releaseTag = answers.releaseTag;
  }

  const parsedVersion = semver.parse(releaseTag);
  const isPrerelease = parsedVersion ? parsedVersion.prerelease.length > 0 : true;

  const tags = [releaseTag];

  if (!noLatest && !isPrerelease) {
    tags.push(LATEST_TAG);
  }

  if (!yes) {
    const baseImage = `${IMAGE_NAME}:${commit}`;
    const imagesToBePublished = tags.map((tag) => `${IMAGE_NAME}:${tag}`);
    const message = [
      `Docker image ${chalk.blue(baseImage)} will be published as:`,
      ...imagesToBePublished.map((image) => `    - ${chalk.blue(image)}`),
      `  Does this look right?`,
    ].join('\n');

    const answers = await inquirer.prompt([
      {
        name: 'publishConfirmed',
        type: 'confirm',
        message,
      },
    ]);

    if (!answers.publishConfirmed) {
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

yargs(hideBin(process.argv))
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
        })
        .option('no-latest', {
          describe: 'Don\'t create the "latest" tag.',
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
