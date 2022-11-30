import fetch, { Headers, Request, Response } from 'node-fetch';

if (typeof globalThis.fetch === 'function') {
  // This polyfill can be removed once we're all on node.js 18
  console.error(`Unnecessary fetch polyfill used`);
} else {
  // @ts-expect-error node-fetch is not a fully compatible polyfill
  globalThis.fetch = fetch;
  // @ts-expect-error node-fetch is not a fully compatible polyfill
  globalThis.Headers = Headers;
  // @ts-expect-error node-fetch is not a fully compatible polyfill
  globalThis.Request = Request;
  // @ts-expect-error node-fetch is not a fully compatible polyfill
  globalThis.Response = Response;
}
