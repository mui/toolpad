import 'fastestsmallesttextencoderdecoder';
import { Headers } from 'headers-polyfill';
import { URL, URLSearchParams } from 'whatwg-url';

global.Headers = Headers;
global.URL = URL;
global.URLSearchParams = URLSearchParams;

const __TOOLPAD_BRIDGE__ = global.__TOOLPAD_BRIDGE__;

function consoleMethod(level) {
  return (...args) => {
    __TOOLPAD_BRIDGE__.console.apply(null, [level, JSON.stringify(args)], {
      arguments: { copy: true },
    });
  };
}

global.console = {
  log: consoleMethod('log'),
  debug: consoleMethod('debug'),
  info: consoleMethod('info'),
  warn: consoleMethod('warn'),
  error: consoleMethod('error'),
};

global.setTimeout = (cb, ms) => {
  return __TOOLPAD_BRIDGE__.setTimeout.applySync(null, [cb, ms], {
    arguments: { reference: true },
    result: { copy: true },
  });
};

global.clearTimeout = (timeout) => {
  return __TOOLPAD_BRIDGE__.clearTimeout.applyIgnored(null, [timeout], {
    arguments: { copy: true },
  });
};

const INTERNALS = Symbol('Fetch internals');

global.Response = class Response {
  constructor() {}

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

  json(...args) {
    return this[INTERNALS].getSync('json').apply(null, args, {
      arguments: { copy: true },
      result: { copy: true, promise: true },
    });
  }

  text(...args) {
    return this[INTERNALS].getSync('text').apply(null, args, {
      arguments: { copy: true },
      result: { copy: true, promise: true },
    });
  }
};

global.fetch = async (...args) => {
  const response = new Response();
  response[INTERNALS] = await __TOOLPAD_BRIDGE__.fetch.apply(null, args, {
    arguments: { copy: true },
    result: { promise: true },
  });
  return response;
};
