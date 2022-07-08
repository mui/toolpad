import { NextRequest, NextResponse } from 'next/server';
import config from './src/server/config';

const BASIC_AUTH_WHITELIST = new Set(['/health-check']);

export function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url);

  if (!config.basicAuthUser || BASIC_AUTH_WHITELIST.has(pathname)) {
    return NextResponse.next();
  }

  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const auth = basicAuth.split(' ')[1];
    const [user, pwd] = atob(auth).toString().split(':');

    if (user === config.basicAuthUser && pwd === config.basicAuthPassword) {
      return NextResponse.next();
    }
  }

  return new Response(null, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}
