import { NextRequest, NextResponse, URLPattern } from 'next/server';
import { checkBasicAuthHeader } from './src/server/basicAuth';

const BASIC_AUTH_WHITELIST = [
  // Healthcheck must always be public
  new URLPattern({ pathname: '/health-check' }),

  // Static content is public
  new URLPattern({ pathname: '/_next/static/*' }),
  new URLPattern({ pathname: '/static/*' }),

  // Apps must be able to be public
  // These urls will handle their own basic auth when the corresponding Toolpad app is not public
  new URLPattern({ pathname: '/deploy/*' }),
  new URLPattern({ pathname: '/api/data/*' }),
];

export function middleware(req: NextRequest) {
  const isWhitelisted = BASIC_AUTH_WHITELIST.some((pattern) => pattern.test(req.url));
  if (isWhitelisted) {
    return NextResponse.next();
  }

  if (checkBasicAuthHeader(req.headers.get('authorization'))) {
    return NextResponse.next();
  }

  return new NextResponse(null, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}
