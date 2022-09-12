import { BindableAttrValue, ConstantAttrValue } from '@mui/toolpad-core';
import { Har } from 'har-format';
import { Maybe } from '../../utils/types';

interface AuthenticationBase {
  type: 'basic' | 'bearerToken' | 'apiKey';
}

export interface BasicAuth extends AuthenticationBase {
  type: 'basic';
  user: string;
  password: string;
}

export interface BearerTokenAuth extends AuthenticationBase {
  type: 'bearerToken';
  token: string;
}

export interface ApiKeyAuth extends AuthenticationBase {
  type: 'apiKey';
  header: string;
  key: string;
}

export type Authentication = BasicAuth | BearerTokenAuth | ApiKeyAuth;

export interface RestConnectionParams {
  baseUrl?: string;
  headers?: [string, string][];
  authentication?: Maybe<Authentication>;
}

export type RawBody = {
  kind: 'raw';
  content: BindableAttrValue<string>;
  contentType: ConstantAttrValue<string>;
};

export type UrlEncodedBody = {
  kind: 'urlEncoded';
  content: [string, BindableAttrValue<string>][];
};

export type Body = RawBody | UrlEncodedBody;

export interface FetchQuery {
  /**
   * The URL of the rquest.
   */
  readonly url: BindableAttrValue<string>;
  /**
   * The request method.
   */
  readonly method: string;
  /**
   * Extra request headers.
   */
  readonly headers: [string, BindableAttrValue<string>][];
  /**
   * Extra url query parameters.
   */
  readonly searchParams?: [string, BindableAttrValue<string>][];
  /**
   * The request body.
   */
  readonly body?: Body;
  /**
   * Run a custom transformer on the response.
   */
  readonly transformEnabled?: boolean;
  /**
   * The custom transformer to run when enabled.
   */
  readonly transform?: string;
  /**
   * Don't parse the content automatically, always return the raw response.
   */
  readonly rawResponse?: boolean;
}

export type FetchParams = {
  readonly searchParams: [string, BindableAttrValue<any>][];
  readonly body?: Body;
};

export type FetchPrivateQuery = {
  kind: 'debugExec';
  query: FetchQuery;
  params: Record<string, any>;
};

export interface FetchResult {
  data: any;
  untransformedData: any;
  error?: Error;
  har: Har;
}
