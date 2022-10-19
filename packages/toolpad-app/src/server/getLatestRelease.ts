const LATEST_RELEASE_API_URL = 'https://api.github.com/repos/mui/mui-toolpad/releases/latest';

interface GithubRelease {
  tag: string;
  url: string;
}

function abortSignalTimeout(ms: number): AbortSignal {
  // @ts-expect-error See https://github.com/microsoft/TypeScript/issues/48003
  if (AbortSignal.timeout) {
    console.warn('Next.js support AbortSignal.timeout, remove this polyfill');
    // @ts-expect-error See https://github.com/microsoft/TypeScript/issues/48003
    return AbortSignal.timeout(ms);
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

async function fetchRelease(): Promise<GithubRelease> {
  const response = await fetch(LATEST_RELEASE_API_URL, {
    // Abort the request after 30 seconds
    signal: abortSignalTimeout(30_000),
  });

  if (response.ok) {
    const { tag_name: tag, html_url: url } = await response.json();
    return { tag, url };
  }

  throw new Error(`Failed to fetch latest release from Github API: ${response.status}`);
}

let nextFetchAllowedAt = 0;
let cached: Promise<GithubRelease> | null;

export async function getLatestToolpadRelease(): Promise<GithubRelease> {
  const now = Date.now();
  if (nextFetchAllowedAt < now || !cached) {
    cached = (async () => {
      try {
        const response = await fetchRelease();
        return response;
      } catch (error) {
        cached = null;
        throw error;
      }
    })();

    nextFetchAllowedAt = now + 1000 * 60 * 10;
  }

  return cached;
}
