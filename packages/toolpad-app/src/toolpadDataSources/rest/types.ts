import { BindableAttrValue } from '@mui/toolpad-core';

export interface RestConnectionParams {}

export interface FetchQuery {
  /**
   * @deprecated To be removed when QueryStateNode is removed
   */
  readonly params: Record<string, string>;
  readonly url: BindableAttrValue<string>;
  readonly method: string;
  readonly headers: [string, BindableAttrValue<string>][];
}
