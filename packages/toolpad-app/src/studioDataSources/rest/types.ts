import { StudioBindable } from '../../types';

export interface RestConnectionParams {}

export interface FetchQuery {
  readonly params: Record<string, string>;
  readonly url: StudioBindable<string>;
  readonly method: string;
  readonly headers: [string, StudioBindable<string>][];
}
