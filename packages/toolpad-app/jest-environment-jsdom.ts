import { TextDecoder, TextEncoder } from 'util';
import fetch, { Headers, Request, Response } from 'node-fetch';

const JsdomEnvironment = require('jest-environment-jsdom').default;

export default class CustomJsdomEnvironment extends JsdomEnvironment {
  async setup() {
    await super.setup();

    if (!this.global.TextDecoder) {
      this.global.TextDecoder = TextDecoder;
    } else {
      throw new Error(`Unnecessary polyfill "TextDecoder"`);
    }

    if (!this.global.TextEncoder) {
      this.global.TextEncoder = TextEncoder;
    } else {
      throw new Error(`Unnecessary polyfill "TextEncoder"`);
    }

    if (!this.global.fetch) {
      this.global.fetch = fetch;
      this.global.Headers = Headers;
      this.global.Request = Request;
      this.global.Response = Response;
    } else {
      throw new Error(`Unnecessary polyfill "fetch"`);
    }
  }
}
