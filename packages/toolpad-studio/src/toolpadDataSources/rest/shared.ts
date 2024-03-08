import { BindableAttrValue } from '@toolpad/studio-runtime';
import { ensureSuffix } from '@toolpad/utils/strings';
import { Maybe } from '@toolpad/utils/types';
import { Authentication, RestConnectionParams } from './types';
import type { RuntimeConfig } from '../../types';

export const HTTP_NO_BODY = new Set(['GET', 'HEAD']);

export function getAuthenticationHeaders(auth: Maybe<Authentication>): [string, string][] {
  if (!auth) {
    return [];
  }

  switch (auth.type) {
    case 'basic':
      return [
        [
          'Authorization',
          `Basic ${Buffer.from(`${auth.user}:${auth.password}`, 'utf-8').toString('base64')}`,
        ],
      ];
    case 'bearerToken':
      return [['Authorization', `Bearer ${auth.token}`]];
    case 'apiKey':
      return [[auth.header, auth.key]];
    default:
      throw new Error(`Unsupported authentication type "${(auth as Authentication).type}"`);
  }
}

export function parseBaseUrl(baseUrl: string): URL {
  const parsedBase = new URL(baseUrl);
  parsedBase.pathname = ensureSuffix(parsedBase.pathname, '/');
  parsedBase.search = '';
  parsedBase.hash = '';
  return parsedBase;
}

export function getDefaultUrl(
  config: RuntimeConfig,
  connection?: RestConnectionParams | null,
): BindableAttrValue<string> {
  const baseUrl = connection?.baseUrl;

  return baseUrl
    ? ''
    : new URL('/static/movies.json', config.externalUrl || window.location.href).href;
}
