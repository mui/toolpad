import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import type { Provider } from 'next-auth/providers';

const providers: Provider[] = [
  GitHub({
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  }),
  Credentials({
    credentials: {
      email: { label: 'Email Address', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    authorize(c) {
      if (c.password !== 'password') {
        return null;
      }
      return {
        id: 'test',
        name: 'Test User',
        email: String(c.email),
      };
    },
  }),
];

export const providerMap = providers.map((provider) => {
  if (typeof provider === 'function') {
    const providerData = provider();
    return { id: providerData.id, name: providerData.name };
  }
  return { id: provider.id, name: provider.name };
});

const missingVars: string[] = [];

if (!process.env.GITHUB_CLIENT_ID) {
  missingVars.push('GITHUB_CLIENT_ID');
}
if (!process.env.GITHUB_CLIENT_SECRET) {
  missingVars.push('GITHUB_CLIENT_SECRET');
}

if (missingVars.length > 0) {
  const baseMessage =
    'Authentication is configured but the following environment variables are missing:';

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`error - ${baseMessage} ${missingVars.join(', ')}`);
  } else {
    console.warn(
      `\u001b[33mwarn\u001b[0m - ${baseMessage} \u001b[31m${missingVars.join(', ')}\u001b[0m`,
    );
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isPublicPage = nextUrl.pathname.startsWith('/public');

      if (isPublicPage || isLoggedIn) {
        return true;
      }

      return false; // Redirect unauthenticated users to login page
    },
  },
});
