import { ensureSuffix } from '@toolpad/utils/strings';
import { Maybe } from '@toolpad/utils/types';
import { Authentication } from './types';

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
