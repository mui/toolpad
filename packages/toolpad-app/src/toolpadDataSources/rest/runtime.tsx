import type { Entry } from 'har-format';
import { getBrowserRuntime } from '@mui/toolpad-core/jsBrowserRuntime';
import { ExecFetchFn, RuntimeDataSource } from '../../types';
import { FetchQuery, FetchResult } from './types';
import { execfetch } from './shared';
import { createHarLog } from '../../utils/har';

export async function clientExec(
  fetchQuery: FetchQuery,
  params: Record<string, string>,
  serverFetch: ExecFetchFn<FetchQuery, FetchResult>,
): Promise<FetchResult> {
  if (fetchQuery.browser) {
    const har = createHarLog();

    const instrumentedFetch = async (...args: Parameters<typeof fetch>) => {
      const startTime = Date.now();
      const req = new Request(...args);
      const url = new URL(req.url);
      const res = await window.fetch(req);
      const entry: Entry = {
        startedDateTime: new Date(startTime).toISOString(),
        request: {
          bodySize: 0,
          cookies: [],
          headers: Array.from(req.headers, ([name, value]) => ({ name, value })),
          headersSize: 0,
          httpVersion: '',
          method: req.method,
          queryString: Array.from(url.searchParams, ([name, value]) => ({ name, value })),
          url: url.href,
        },
        response: {
          bodySize: 0,
          content: {
            mimeType: res.headers.get('content-type') || '',
            size: Number(res.headers.get('content-length')) || 0,
          },
          cookies: [],
          headers: Array.from(res.headers, ([name, value]) => ({ name, value })),
          headersSize: 0,
          httpVersion: '',
          redirectURL: '',
          status: res.status,
          statusText: res.statusText,
        },
        cache: {},
        time: Date.now() - startTime,
        timings: {
          wait: 0,
          receive: 0,
        },
      };
      har.log.entries.push(entry);
      return res;
    };

    const result = await execfetch(fetchQuery, params, {
      connection: null,
      fetchImpl: instrumentedFetch,
      jsRuntime: getBrowserRuntime(),
    });

    return { ...result, har };
  }

  return serverFetch(fetchQuery, params);
}

const dataSource: RuntimeDataSource<FetchQuery, FetchResult> = {
  exec: clientExec,
};

export default dataSource;
