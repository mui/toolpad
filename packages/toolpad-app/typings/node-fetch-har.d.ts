declare module 'node-fetch-har' {
  import { Har } from 'har-format';

  export interface WithHarOptions {
    har?: Har;
  }

  export function withHar(fetch: typeof fetch, options?: WithHarOptions): typeof fetch;
  export function createHarLog(): Har;
}
