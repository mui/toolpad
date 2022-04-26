import { BindableAttrValue } from '@mui/toolpad-core';

export interface RestConnectionParams {}

export interface FetchQuery {
  readonly params: Record<string, string>;
  readonly url: BindableAttrValue<string>;
  readonly method: string;
  readonly headers: [string, BindableAttrValue<string>][];
}
