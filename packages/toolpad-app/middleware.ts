import { NextRequest, NextResponse, URLPattern } from 'next/server';
import config from './src/server/config';

const BASIC_AUTH_WHITELIST = [
  // Healthcheck must always be public
  new URLPattern({ pathname: '/health-check' }),

  // Apps must be able to be public
  // These urls will handle their own basic auth when the app is not public
  new URLPattern({ pathname: '/_next/static/*' }),
  new URLPattern({ pathname: '/deploy/:appId/*' }),
  new URLPattern({ pathname: '/api/data/:appId/:version/:queryId' }),
];

export function middleware(req: NextRequest) {
  if (!config.basicAuthUser || BASIC_AUTH_WHITELIST.some((pattern) => pattern.test(req.url))) {
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
