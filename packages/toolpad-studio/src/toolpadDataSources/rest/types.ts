import { BindableAttrValue, ExecFetchResult } from '@toolpad/studio-runtime';
import type { Har } from 'har-format';
import { Maybe } from '@toolpad/utils/types';

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
  contentType: string;
};

export type UrlEncodedBody = {
  kind: 'urlEncoded';
  content: [string, BindableAttrValue<string>][];
};

export type Body = RawBody | UrlEncodedBody;

export type RawResponseType = {
  kind: 'raw';
};

export type JsonResponseType = {
  kind: 'json';
};

export type CsvResponseType = {
  kind: 'csv';
  /**
   * First row contains headers
   */
  headers: boolean;
};

export type XmlResponseType = {
  kind: 'xml';
};

export type ResponseType = RawResponseType | JsonResponseType | CsvResponseType | XmlResponseType;

export interface FetchQuery {
  /**
   * Run in the browser.
   */
  readonly browser?: boolean;
  /**
   * The URL of the rquest.
   */
  readonly url?: BindableAttrValue<string>;
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
   * How to parse the response.
   */
  readonly response?: ResponseType;
}

export type FetchParams = {
  readonly searchParams: [string, BindableAttrValue<any>][];
  readonly body?: Body;
};

export type FetchPrivateQuery =
  | {
      kind: 'debugExec';
      query: FetchQuery;
      params: Record<string, any>;
    }
  | { kind: 'introspection' };

export interface FetchResult extends ExecFetchResult<any> {
  data: any;
  untransformedData: any;
  har?: Har;
}

export type IntrospectionResult = {
  env: Record<string, string | undefined>;
  declaredEnvKeys: string[];
};
