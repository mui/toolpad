import NextAuth from 'next-auth';
import authConfig from './auth.config';

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};

export const { auth: middleware } = NextAuth(authConfig);
