const LATEST_RELEASE_API_URL = 'https://api.github.com/repos/mui/mui-toolpad/releases/latest';

interface GithubRelease {
  tag: string;
  url: string;
}

async function fetchRelease(): Promise<GithubRelease> {
  const response = await fetch(LATEST_RELEASE_API_URL, {
    // Abort the request after 30 seconds
    // @ts-expect-error See https://github.com/microsoft/TypeScript/issues/48003
    signal: AbortSignal.timeout(30_000),
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
