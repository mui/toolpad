import { TokenSet } from '@auth/core/types';
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google, { GoogleProfile } from 'next-auth/providers/google';
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
      if (c.email === 'admin@mui.com') {
        return {
          id: 'test',
          name: 'Test User',
          email: String(c.email),
          roles: ['ADMIN'],
        };
      }
      return {
        id: 'test',
        name: 'Test User',
        email: String(c.email),
      };
    },
  }),
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authorization: {
      params: {
        scope: [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/cloud-identity.groups.readonly',
        ].join(' '),
      },
    },
    profile: async (profile: GoogleProfile, tokens: TokenSet) => {
      try {
        // Fetch user's groups using Cloud Identity API
        const groupsResponse = await fetch(
          `https://cloudidentity.googleapis.com/v1/groups/-/memberships:searchDirectGroups?${new URLSearchParams(
            {
              query: `member_key_id == '${profile.email}'`,
            },
          )}`,
          {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          },
        );

        const groupsData = await groupsResponse.json();
        const groups: string[] = [];
        const roles: string[] = [];
        groupsData.memberships?.forEach((m: any) => {
          groups.push(m.group);
          roles.push(...m.roles.map((r: any) => r.name));
        });

        return {
          ...profile,
          id: profile.sub,
          image: profile.picture,
          groups,
          roles,
        };
      } catch (error) {
        console.error('Error fetching groups:', error);
        return {
          ...profile,
          id: profile.sub,
          image: profile.picture,
          groups: [],
          role: 'user',
        };
      }
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
    jwt({ token, user }) {
      if (user) {
        token.roles = user.roles;
        token.groups = user.groups;
      }
      return token;
    },
    session({ session, token }) {
      session.user.roles = token.roles;
      session.user.groups = token.groups;
      return session;
    },
  },
});
