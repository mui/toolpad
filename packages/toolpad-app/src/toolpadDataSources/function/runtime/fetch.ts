import type * as ivm from 'isolated-vm';
import { Headers } from 'headers-polyfill';

const TOOLPAD_BRIDGE = global.TOOLPAD_BRIDGE;

const INTERNALS = Symbol('Fetch internals');

class Response {
  [INTERNALS]: ivm.Reference;

  x = null;

  get ok() {
    return this[INTERNALS].getSync('ok');
  }

  get status() {
    return this[INTERNALS].getSync('status');
  }

  get statusText() {
    return this[INTERNALS].getSync('statusText');
  }

  get headers() {
    return new Headers(this[INTERNALS].getSync('headers').copy());
  }

  json() {
    return this[INTERNALS].getSync('json').apply(null, [], {
      arguments: { copy: true },
      result: { copy: true, promise: true },
    });
  }

  text() {
    return this[INTERNALS].getSync('text').apply(null, [], {
      arguments: { copy: true },
      result: { copy: true, promise: true },
    });
  }
}

async function fetch(...args) {
  const response = new Response();
  response[INTERNALS] = await TOOLPAD_BRIDGE.fetch.apply(null, args, {
    arguments: { copy: true },
    result: { promise: true },
  });
  return response;
}

global.Headers = Headers;
global.Response = Response;
global.fetch = fetch;

export {};
