import type { SupportedAuthProvider } from '@toolpad/core/SignInPage';
import { kebabToConstant, kebabToPascal } from '@toolpad/utils/strings';
import { requiresIssuer, requiresTenantId } from './utils';
import { Template } from '../../../types';

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

const NodemailerTemplate = `Nodemailer({
    server: {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      secure: true,
    },
    from: process.env.EMAIL_FROM,
  }),`;

const PasskeyTemplate = 'Passkey,';

const oAuthProviderTemplate = (provider: SupportedAuthProvider) => `
  ${kebabToPascal(provider)}({
    clientId: process.env.${kebabToConstant(provider)}_CLIENT_ID,
    clientSecret: process.env.${kebabToConstant(provider)}_CLIENT_SECRET,${requiresIssuer(provider) ? `\n\t\tissuer: process.env.${kebabToConstant(provider)}_ISSUER,` : ''}${requiresTenantId(provider) ? `\n\t\ttenantId: process.env.${kebabToConstant(provider)}_TENANT_ID,` : ''}
  }),`;
const checkEnvironmentVariables = (providers: SupportedAuthProvider[] | undefined) => `${providers
  ?.filter((p) => p !== 'credentials')
  .map((provider) => {
    if (provider === 'nodemailer') {
      return `if(!process.env.DATABASE_URL || !process.env.EMAIL_SERVER_HOST) { \nconsole.warn('The Nodemailer provider requires configuring a database and an email server.')\n}`;
    }
    if (provider === 'passkey') {
      return `if(!process.env.DATABASE_URL) { \nconsole.warn('The passkey provider requires configuring a database.')\n}`;
    }
    return `if(!process.env.${kebabToConstant(provider)}_CLIENT_ID) { 
  console.warn('Missing environment variable "${kebabToConstant(provider)}_CLIENT_ID"');
}
if(!process.env.${kebabToConstant(provider)}_CLIENT_SECRET) {
  console.warn('Missing environment variable "${kebabToConstant(provider)}_CLIENT_SECRET"');
}${
      requiresTenantId(provider)
        ? `
if(!process.env.${kebabToConstant(provider)}_TENANT_ID) { 
  console.warn('Missing environment variable "${kebabToConstant(provider)}_TENANT_ID"');
}`
        : ''
    }${
      requiresIssuer(provider)
        ? `
if(!process.env.${kebabToConstant(provider)}_ISSUER) {
  console.warn('Missing environment variable "${kebabToConstant(provider)}_ISSUER"');
}`
        : ''
    }`;
  })
  .join('\n')}
`;

const auth: Template = (options) => {
  const providers = options.authProviders;

  return `import NextAuth from 'next-auth';\n${providers
    ?.map(
      (provider) =>
        `import ${kebabToPascal(provider)} from 'next-auth/providers/${provider.toLowerCase()}';`,
    )
    .join('\n')}
import type { Provider } from 'next-auth/providers';
${options.hasNodemailerProvider || options.hasPasskeyProvider ? `\nimport { PrismaAdapter } from '@auth/prisma-adapter';\nimport { prisma } from './prisma';` : ''}

const providers: Provider[] = [${providers
    ?.map((provider) => {
      if (provider === 'credentials') {
        return CredentialsProviderTemplate;
      }
      if (provider === 'nodemailer') {
        return NodemailerTemplate;
      }
      if (provider === 'passkey') {
        return PasskeyTemplate;
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
  ${options.hasNodemailerProvider || options.hasPasskeyProvider ? `\nadapter: PrismaAdapter(prisma),` : ''}
  ${options.hasNodemailerProvider || (options.router === 'nextjs-app' && options.hasPasskeyProvider && providers && providers.length > 1) ? `\nsession: { strategy: 'jwt' },` : ''}
  ${
    options.hasPasskeyProvider
      ? `\nexperimental: {
    enableWebAuthn: true,
  },`
      : ''
  }    
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
