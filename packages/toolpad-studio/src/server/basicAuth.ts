import type { IncomingMessage, ServerResponse } from 'http';
import config from './config';

export function checkBasicAuthHeader(headerContent: string | null): boolean {
  if (!config.basicAuthUser) {
    return true;
  }

  if (headerContent) {
    const auth = headerContent.split(' ')[1];
    const [user, pwd] = atob(auth).toString().split(':');

    if (user === config.basicAuthUser && pwd === config.basicAuthPassword) {
      return true;
    }
  }

  return false;
}

export function checkBasicAuth(req: IncomingMessage): boolean {
  return checkBasicAuthHeader(req.headers.authorization || null);
}

export function basicAuthUnauthorized(res: ServerResponse): void {
  res.setHeader('WWW-Authenticate', 'Basic realm="Protected"');
  res.statusCode = 401;
  res.end('Unauthorized');
}
