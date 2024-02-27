import * as execa from 'execa';

const $ = execa.$({ stdio: 'inherit' });

export async function updateToBranch(dependency: string, repo: string, branch: string = 'master') {
  // eslint-disable-next-line no-console
  console.log(`Updating "${repo}" to branch "${branch}"...`);

  await $`pnpm update -r ${dependency}@github:${repo}#${encodeURIComponent(branch)}`;
}

export async function dedupe() {
  // eslint-disable-next-line no-console
  console.log(`Deduping...`);

  await $({ stdio: 'inherit' })`pnpm dedupe`;
}

export async function updateToLatestCommit(
  dependency: string,
  repo: string,
  branch: string = 'master',
) {
  const url = new URL(`https://api.github.com/repos/${repo}/commits`);
  url.searchParams.set('sha', branch);
  url.searchParams.set('per_page', '1');
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} while fetching "${url}"`);
  }
  const commits = await res.json();

  if (commits.length <= 0) {
    throw new Error(`No commits found for "${branch}"`);
  }

  const latestCommit: string = commits[0].sha;

  await updateToBranch(dependency, repo, latestCommit);
}
