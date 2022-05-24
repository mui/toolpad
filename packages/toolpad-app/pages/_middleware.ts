import { NextRequest, NextResponse } from 'next/server';
import config from '../src/server/config';

export function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url);

  if (pathname === '/health-check' || !config.basicAuthUser) {
    return NextResponse.next();
  }

  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const auth = basicAuth.split(' ')[1];
    const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':');

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
