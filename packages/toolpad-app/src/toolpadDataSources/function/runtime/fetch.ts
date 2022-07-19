import { Headers } from 'headers-polyfill';
import { ResponseStub, ToolpadFunctionRuntimeBridge } from './types';

const TOOLPAD_BRIDGE: ToolpadFunctionRuntimeBridge = global.TOOLPAD_BRIDGE;

const INTERNALS = Symbol('Fetch internals');

class Response {
  [INTERNALS]: ResponseStub;

  get ok(): boolean {
    return this[INTERNALS].ok;
  }

  get status(): number {
    return this[INTERNALS].status;
  }

  get statusText(): string {
    return this[INTERNALS].statusText;
  }

  get headers(): Headers {
    return new Headers(this[INTERNALS].headers.copy());
  }

  async json(): Promise<any> {
    return this[INTERNALS].json.apply(null, [], {
      arguments: { copy: true },
      result: { copy: true, promise: true },
    });
  }

  async text(): Promise<string> {
    return this[INTERNALS].text.apply(null, [], {
      arguments: { copy: true },
      result: { copy: true, promise: true },
    });
  }
}

async function fetch(input: RequestInfo | URL, init?: RequestInit) {
  const response = new Response();

  response[INTERNALS] = await TOOLPAD_BRIDGE.fetch.apply(null, [input, init], {
    arguments: { copy: true },
    result: { promise: true, copy: true },
  });

  return response;
}

global.Headers = Headers;
global.Response = Response;
global.fetch = fetch;

export {};
