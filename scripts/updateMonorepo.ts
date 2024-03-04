import { dedupe, updateToLatestCommit } from './gitUtils';

async function main() {
  await updateToLatestCommit('@mui/monorepo', 'mui/material-ui');
  await dedupe();
}
main();
