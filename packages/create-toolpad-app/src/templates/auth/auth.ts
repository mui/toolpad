import { kebabToConstant } from '@toolpad/utils/strings';
import { ProvidersTemplate, SupportedAuthProvider } from '../../types';

const CredentialsProviderTemplate = `Credentials({
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
}),`;

const checkEnvironmentVariables = (providers: SupportedAuthProvider[]) => `
const missingVars: string[] = [];
${providers
  .filter((p) => p !== 'credentials')
  .map(
    (provider) => `
if (!process.env.${kebabToConstant(provider)}_CLIENT_ID) {
  missingVars.push('${kebabToConstant(provider)}_CLIENT_ID');
}
if (!process.env.${kebabToConstant(provider)}_CLIENT_SECRET) {
  missingVars.push('${kebabToConstant(provider)}_CLIENT_SECRET');
}`,
  )
  .join('\n')}

if (missingVars.length > 0) {
  const message = \`Authentication is configured but the following environment variables are missing: \${missingVars.join(', ')}\`;
  
  if (process.env.NODE_ENV === 'production') {
    throw new Error(message);
  } else {
    console.warn(message);
  }
}`;

const oAuthProviderTemplate = (provider: SupportedAuthProvider) => `
${provider}({
  clientId: process.env.${kebabToConstant(provider)}_CLIENT_ID,
  clientSecret: process.env.${kebabToConstant(provider)}_CLIENT_SECRET,
}),`;

const auth: ProvidersTemplate = (providers) => {
  return `import NextAuth from 'next-auth';
  ${providers
    .map((provider) => `import ${provider} from 'next-auth/providers/${provider.toLowerCase()}';`)
    .join('\n')}
import type { Provider } from 'next-auth/providers';

const providers: Provider[] = [
    ${providers
      .map((provider) => {
        if (provider === 'credentials') {
          return CredentialsProviderTemplate;
        }
        return oAuthProviderTemplate(provider);
      })
      .join('\n')}
];

${checkEnvironmentVariables(providers)}

export const providerMap = providers.map((provider) => {
  if (typeof provider === 'function') {
    const providerData = provider();
    return { id: providerData.id, name: providerData.name };
  }
  return { id: provider.id, name: provider.name };
});

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
  `;
};

export default auth;
