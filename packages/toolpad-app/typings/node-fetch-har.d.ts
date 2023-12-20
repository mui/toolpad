declare module 'node-fetch-har' {
  import type { Har } from 'har-format';
  import fetch from 'node-fetch';

  export interface WithHarOptions {
    har?: Har;
  }

  export function withHar(fetchFn: typeof fetch, options?: WithHarOptions): typeof fetch;
}
