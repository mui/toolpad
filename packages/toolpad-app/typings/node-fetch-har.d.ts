declare module 'node-fetch-har' {
  import type { Har } from 'har-format';
  import fetch from 'node-fetch';

  export interface WithHarOptions {
    har?: Har;
  }

  export type FetchFn = (...args: Parameters<typeof fetch>) => ReturnType<typeof fetch>;

  export function withHar(fetchFn: typeof fetch, options?: WithHarOptions): FetchFn;
}
