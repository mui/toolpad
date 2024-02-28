import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { dedupe, updateToBranch } from './gitUtils';

async function main(argv) {
  await updateToBranch('@mui/monorepo', 'mui/material-ui', `refs/pull/${argv.pr}/head`);
  await dedupe();
}

yargs(hideBin(process.argv))
  .command({
    command: '$0',
    description: 'transpile TypeScript demos',
    builder: (command) => {
      return command
        .option('pr', {
          description: 'PR number',
        })
        .demandOption('pr');
    },
    handler: main,
  })
  .help()
  .strict(true)
  .version(false)
  .parse();
