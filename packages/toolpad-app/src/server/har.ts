import { withHar as withHarOriginal } from 'node-fetch-har';
import fetch, { Request } from 'node-fetch';

const withHarInstrumentation: typeof withHarOriginal = function withHar(fetchFn, options) {
  const withHarFetch = withHarOriginal(fetchFn, options);

  const patchedFetch = (...args: Parameters<typeof fetch>): ReturnType<typeof fetch> => {
    // node-fetch-har doesn't deal well with certain ways of passing parameters e.g. passing headers as [string, string][]
    // We're normalizing them here to a format that we know it can handle correctly:
    const req = new Request(...args);
    const input = req.url;
    return withHarFetch(input, {
      agent: req.agent,
      body: req.body,
      compress: req.compress,
      follow: req.follow,
      headers: req.headers,
      method: req.method,
      redirect: req.redirect,
    });
  };

  patchedFetch.isRedirect = fetch.isRedirect;

  return patchedFetch;
};

export { createHarLog } from '../utils/har';
export { withHarInstrumentation };
