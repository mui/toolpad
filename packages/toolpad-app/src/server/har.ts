import { withHar as withHarOriginal } from 'node-fetch-har';
import fetch, { Request } from 'node-fetch';

const withHarInstrumentation: typeof withHarOriginal = function withHar(fetchFn, options) {
  const withHarFetch = withHarOriginal(fetchFn, options);

  const patchedfetch: typeof fetch = (reqInfo, reqInit) => {
    // node-fetch-har doesn't deal well with certain ways of passing parameters e.g. passing headers as [string, string][]
    // We're normalizing them here to a format that we know it can handle correctly:
    const req = new Request(reqInfo, reqInit);

    const input = req.url;
    return withHarFetch(input, {
      agent: reqInit?.agent,
      body: req.body,
      compress: reqInit?.compress,
      follow: reqInit?.follow,
      headers: req.headers,
      method: req.method,
      redirect: req.redirect,
    });
  };

  return patchedfetch;
};

export { createHarLog } from '../utils/har';
export { withHarInstrumentation };
