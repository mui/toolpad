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

export function checkBasicAuth(req: IncomingMessage, res: ServerResponse): boolean {
  if (checkBasicAuthHeader(req.headers.authorization || null)) {
    return true;
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Protected"');
  res.statusCode = 401;
  res.end('Unauthorized');
  return false;
}
