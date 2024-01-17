import * as execa from 'execa';

const $ = execa.$({ stdio: 'inherit' });

async function updateToLatest(repo: string, branch: string = 'master') {
  const url = `https://api.github.com/repos/${repo}/commits?sha=${branch}&per_page=1`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} while fetching "${url}"`);
  }
  const commits = await res.json();
  const latestCommit: string = commits[0]?.sha;

  // eslint-disable-next-line no-console
  console.log(`Updating "${repo}" to latest commit ${latestCommit}...`);

  await $`pnpm update -r @mui/monorepo@github:mui/material-ui#${latestCommit}`;

  // eslint-disable-next-line no-console
  console.log(`Deduping...`);

  await $({ stdio: 'inherit' })`pnpm dedupe`;
}

updateToLatest('mui/material-ui');
