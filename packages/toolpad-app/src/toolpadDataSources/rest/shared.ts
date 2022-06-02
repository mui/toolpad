import { ensureEndsWith } from '../../utils/strings';

export function parseBaseUrl(baseUrl: string): URL {
  const parsedBase = new URL(baseUrl);
  parsedBase.pathname = ensureEndsWith(parsedBase.pathname, '/');
  parsedBase.search = '';
  parsedBase.hash = '';
  return parsedBase;
}
