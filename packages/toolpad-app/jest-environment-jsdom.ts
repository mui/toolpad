import { TextDecoder, TextEncoder } from 'util';
import fetch, { Headers, Request, Response } from 'node-fetch';

const JsdomEnvironment = require('jest-environment-jsdom').default;

export default class CustomJsdomEnvironment extends JsdomEnvironment {
  async setup() {
    await super.setup();

    if (!this.global.TextDecoder) {
      this.global.TextDecoder = TextDecoder;
    } else {
      // eslint-disable-next-line no-console
      console.info('TextDecoder not polyfilled: running on a platform that supports TextDecoder');
    }

    if (!this.global.TextEncoder) {
      this.global.TextEncoder = TextEncoder;
    } else {
      // eslint-disable-next-line no-console
      console.info('TextEncoder not polyfilled: running on a platform that supports TextEncoder');
    }

    if (!this.global.fetch) {
      this.global.fetch = fetch;
      this.global.Headers = Headers;
      this.global.Request = Request;
      this.global.Response = Response;
    } else {
      // eslint-disable-next-line no-console
      console.info('Fetch API not polyfilled: running on a platform that supports fetch');
    }
  }
}
