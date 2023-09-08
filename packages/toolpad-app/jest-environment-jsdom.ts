import { TextDecoder, TextEncoder } from 'util';
import fetch, { Headers, Request, Response } from 'node-fetch';
import JsdomEnvironment from 'jest-environment-jsdom';
import type { RuntimeConfig } from './src/config';
import { RUNTIME_CONFIG_WINDOW_PROPERTY } from './src/constants';

function setRuntimeConfig(win: Window, config: RuntimeConfig) {
  win[RUNTIME_CONFIG_WINDOW_PROPERTY] = config;
}

export default class CustomJsdomEnvironment extends JsdomEnvironment {
  async setup() {
    await super.setup();

    setRuntimeConfig(this.global, {
      externalUrl: 'http://localhost:3000',
      cmd: 'dev',
      projectDir: '.',
    });

    if (!this.global.TextDecoder) {
      // @ts-expect-error The polyfill is not 100% spec-compliant
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
      // @ts-expect-error The polyfill is not 100% spec-compliant
      this.global.fetch = fetch;
      // @ts-expect-error The polyfill is not 100% spec-compliant
      this.global.Headers = Headers;
      // @ts-expect-error The polyfill is not 100% spec-compliant
      this.global.Request = Request;
      // @ts-expect-error The polyfill is not 100% spec-compliant
      this.global.Response = Response;
    } else {
      throw new Error(`Unnecessary polyfill "fetch"`);
    }
  }
}
