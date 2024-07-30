import { PackageJson } from './packageType';

export const rootLayoutContent = `  
  import { AppProvider } from "@toolpad/core/nextjs";
  import DashboardIcon from "@mui/icons-material/Dashboard";
  import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
  import type { Navigation } from "@toolpad/core";
  import theme from '../theme';

  const NAVIGATION: Navigation = [
    {
      kind: 'header',
      title: 'Main items',
    },
    {
      segment: 'page',
      title: 'Page',
      icon: <DashboardIcon />,
    },
  ];
  
  export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {      
    return (
      <html lang="en" data-toolpad-color-scheme="light">
        <body>
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <AppProvider theme={theme} navigation={NAVIGATION}>
              {children}
            </AppProvider>
          </AppRouterCacheProvider>
        </body>
      </html>
    );
  }
    `;

export const rootLayoutAuthAppContent = `
import * as React from 'react';
import { AppProvider } from '@toolpad/core/nextjs';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import DashboardIcon from '@mui/icons-material/Dashboard';
import type { Navigation } from '@toolpad/core';
import { SessionProvider, signIn, signOut } from 'next-auth/react';
import { auth } from '../auth';

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    segment: '',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
];

const BRANDING = {
  title: 'My Toolpad Core App',
};

const AUTHENTICATION = {
  signIn,
  signOut,
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <AppProvider
              navigation={NAVIGATION}
              branding={BRANDING}
              session={session}
              authentication={AUTHENTICATION}
            >
              {props.children}
            </AppProvider>
          </AppRouterCacheProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
`;

export const dashboardLayoutContent = `
  import { DashboardLayout } from '@toolpad/core/DashboardLayout';

  export default function Layout({
    children,
  }: Readonly<{ children: React.ReactNode }>) {
    return (
      <DashboardLayout>{children}</DashboardLayout>
    );
  }
  `;

export const dashboardLayoutAuthAppContent = `import * as React from 'react';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';

export default function DashboardPagesLayout(props: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <PageContainer>{props.children}</PageContainer>
    </DashboardLayout>
  );
}
`;

export const dashboardPageLayoutContent = `
  import { PageContainer } from '@toolpad/core/PageContainer';

  export default function Layout({
    children,
  }: Readonly<{ children: React.ReactNode }>) {
    return (
      <PageContainer>{children}</PageContainer>
    );
  }
  `;

export const rootPageContainer = `
  import Link from "next/link";
  import { Button, Container, Typography, Box } from "@mui/material";

  export default function Home() {
    return (
      <Container>
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to{" "}
            <Link href="https://mui.com/toolpad/core/introduction">
              Toolpad Core!
            </Link>
          </Typography>

          <Typography variant="body1">
            Get started by editing <code>(dashboard)/page/page.tsx</code>
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Link href="/page">
              <Button variant="contained" color="primary">
                Go to Page
              </Button>
            </Link>
          </Box>
        </Box>
      </Container>
    );
  }
  `;

export const dashboardPageContent = `
  import { Typography } from "@mui/material";

  export default function Home() {
    return (
      <main>
        <Typography variant="h6" color="grey.800">
          Hello world!
        </Typography>
      </main>
    );
  }
  `;

export const dashboardPageAuthAppContent = `
import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { auth } from '../../auth';

export default async function HomePage() {
  const session = await auth();

  return (
    <Box
      sx={{
        my: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography variant="h4" component="h1" sx={{ my: 2 }}>
        Welcome to Toolpad, {session?.user?.name || 'User'}!
      </Typography>
    </Box>
  );
}
`;

export const themeContent = `
  "use client";
  import { extendTheme } from '@mui/material/styles';
  import type {} from '@mui/material/themeCssVarsAugmentation';

  const theme = extendTheme({
    colorSchemes: {
      light: {
        palette: {
          background: {
            default: 'var(--mui-palette-grey-50)',
            defaultChannel: 'var(--mui-palette-grey-50)',
          },
        },
      },
      dark: {
        palette: {
          background: {
            default: 'var(--mui-palette-grey-900)',
            defaultChannel: 'var(--mui-palette-grey-900)',
          },
          text: {
            primary: 'var(--mui-palette-grey-200)',
            primaryChannel: 'var(--mui-palette-grey-200)',
          },
        },
      },
    },
  });

  export default theme;
  `;

export const eslintConfigContent = `{    
    "extends": "next/core-web-vitals"        
  }
  `;

export const nextTypesContent = `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
  `;

export const nextConfigContent = `
  /** @type {import('next').NextConfig} */
  const nextConfig = {};
  export default nextConfig;
  `;

export const tsConfigContent = `{
    "compilerOptions": {
      "lib": ["dom", "dom.iterable", "esnext"],
      "allowJs": true,
      "skipLibCheck": true,
      "strict": true,
      "noEmit": true,
      "esModuleInterop": true,
      "module": "esnext",
      "moduleResolution": "bundler",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "jsx": "preserve",
      "incremental": true,
      "plugins": [
        {
          "name": "next"
        }
      ],
      "paths": {
        "@/*": ["./*"]
      }
    },
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    "exclude": ["node_modules"]
  }
  `;

export const gitignoreTemplate = `
  # Logs
  logs
  *.log
  npm-debug.log*
  yarn-debug.log*
  yarn-error.log*
  lerna-debug.log*
  .pnpm-debug.log*
  
  # Diagnostic reports (https://nodejs.org/api/report.html)
  report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json
  
  # Runtime data
  pids
  *.pid
  *.seed
  *.pid.lock
  
  # Directory for instrumented libs generated by jscoverage/JSCover
  lib-cov
  
  # Coverage directory used by tools like istanbul
  coverage
  *.lcov
  
  # nyc test coverage
  .nyc_output
  
  # Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
  .grunt
  
  # Bower dependency directory (https://bower.io/)
  bower_components
  
  # node-waf configuration
  .lock-wscript
  
  # Compiled binary addons (https://nodejs.org/api/addons.html)
  build/Release
  
  # Dependency directories
  node_modules/
  jspm_packages/
  
  # Snowpack dependency directory (https://snowpack.dev/)
  web_modules/
  
  # TypeScript cache
  *.tsbuildinfo
  
  # Optional npm cache directory
  .npm
  
  # Optional eslint cache
  .eslintcache
  
  # Optional stylelint cache
  .stylelintcache
  
  # Microbundle cache
  .rpt2_cache/
  .rts2_cache_cjs/
  .rts2_cache_es/
  .rts2_cache_umd/
  
  # Optional REPL history
  .node_repl_history
  
  # Output of 'npm pack'
  *.tgz
  
  # Yarn Integrity file
  .yarn-integrity
  
  # dotenv environment variable files
  .env
  .env.development.local
  .env.test.local
  .env.production.local
  .env.local
  
  # parcel-bundler cache (https://parceljs.org/)
  .cache
  .parcel-cache
  
  # Next.js build output
  .next
  out
  
  # Nuxt.js build / generate output
  .nuxt
  dist
  
  # Gatsby files
  .cache/
  # Comment in the public line in if your project uses Gatsby and not Next.js
  # https://nextjs.org/blog/next-9-1#public-directory-support
  # public
  
  # vuepress build output
  .vuepress/dist
  
  # vuepress v2.x temp and cache directory
  .temp
  .cache
  
  # Docusaurus cache and generated files
  .docusaurus
  
  # Serverless directories
  .serverless/
  
  # FuseBox cache
  .fusebox/
  
  # DynamoDB Local files
  .dynamodb/
  
  # TernJS port file
  .tern-port
  
  # Stores VSCode versions used for testing VSCode extensions
  .vscode-test
  
  # yarn v2
  .yarn/cache
  .yarn/unplugged
  .yarn/build-state.yml
  .yarn/install-state.gz
  `;

export const authRouterHandlerContent = `
import { handlers } from '../../../../auth';

export const { GET, POST } = handlers;
`;

export const packageJson: PackageJson = {
  version: '0.1.0',
  scripts: {
    dev: 'next dev',
    build: 'next build',
    start: 'next start',
    lint: 'next lint',
  },
  dependencies: {
    react: '^18',
    'react-dom': '^18',
    next: '^14',
    '@toolpad/core': 'latest',
    '@mui/material': 'next',
    '@mui/material-nextjs': 'next',
    '@mui/icons-material': 'next',
    '@emotion/react': '^11',
    '@emotion/styled': '^11',
    '@emotion/cache': '^11',
  },
  devDependencies: {
    typescript: '^5',
    '@types/node': '^20',
    '@types/react': '^18',
    '@types/react-dom': '^18',
    eslint: '^8',
    'eslint-config-next': '^14',
  },
};
export const packageJsonAuthApp: PackageJson = {
  version: '0.1.0',
  scripts: {
    dev: 'next dev',
    build: 'next build',
    start: 'next start',
    lint: 'next lint',
  },
  dependencies: {
    '@emotion/react': '^11.11.4',
    '@emotion/styled': '^11.11.5',
    '@mui/icons-material': '^5.16.0',
    '@mui/lab': '^5.0.0-alpha.170',
    '@mui/material': '^5.16.0',
    '@mui/material-nextjs': '^5.15.11',
    '@toolpad/core': 'latest',
    next: '14.2.4',
    'next-auth': '5.0.0-beta.18',
    react: '18.3.1',
    'react-dom': '18.3.1',
  },
  devDependencies: {
    '@types/node': '^20.14.10',
    '@types/react': '^18.3.3',
    '@types/react-dom': '^18.3.0',
    'eslint-config-next': '14.2.4',
  },
};
//   version: '0.1.0',
//   scripts: {
//     dev: 'next dev',
//     lint: 'next lint',
//   },
//   dependencies: {
//     react: '^18',
//     'react-dom': '^18',
//     next: '^14',
//     'next-auth': '5.0.0-beta.18',
//     '@toolpad/core': 'latest',
//     '@mui/material': 'next',
//     '@mui/material-nextjs': 'next',
//     '@mui/icons-material': 'next',
//     '@emotion/react': '^11',
//     '@emotion/styled': '^11',
//     '@emotion/cache': '^11',
//     '@mui/lab': 'next',
//   },
//   devDependencies: {
//     typescript: '^5',
//     '@types/node': '^20',
//     '@types/react': '^18',
//     '@types/react-dom': '^18',
//     eslint: '^8',
//     'eslint-config-next': '^14',
//   },
// };

export const credentialsProviderContent = `Credentials({
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
      email: 'test@example.com',
    };
  },
}),
`;

export const oAuthProviderContent = (provider: string) => `
${provider}({
  clientId: process.env.${provider.toUpperCase()}_CLIENT_ID,
  clientSecret: process.env.${provider.toUpperCase()}_CLIENT_SECRET,
}),
`;

export const providerImport = (provider: string) => `
import ${provider} from 'next-auth/providers/${provider?.toLowerCase()}';
`;

export const callbacksContent = `
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
`;

export const authImports = `
import NextAuth from 'next-auth';  
`;

export const providerSetupContent = `
import type { Provider } from 'next-auth/providers';

const providers: Provider[] = [
`;
export const providerMapContent = `
];

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
`;

export const authContentEnd = `
});
`;

export const middlewareContent = `
export { auth as middleware } from './auth';

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
`;

export const signInPageContent = `
import * as React from 'react';
import type { AuthProvider } from '@toolpad/core';
import { SignInPage } from '@toolpad/core/SignInPage';
import { AuthError } from 'next-auth';
import { providerMap, signIn } from '../../../auth';

export default function SignIn() {
  return (
    <SignInPage
      providers={providerMap}
      signIn={async (provider: AuthProvider, formData: FormData, callbackUrl?: string) => {
        'use server';
        try {
          return await signIn(provider.id, {
            ...(formData && { email: formData.get('email'), password: formData.get('password') }),
            redirectTo: callbackUrl ?? '/',
          });
        } catch (error) {
          // The desired flow for successful sign in in all cases
          // and unsuccessful sign in for OAuth providers will cause a \`redirect\`,
          // and \`redirect\` is a throwing function, so we need to re-throw
          // to allow the redirect to happen
          // Source: https://github.com/vercel/next.js/issues/49298#issuecomment-1542055642
          // Detect a \`NEXT_REDIRECT\` error and re-throw it
          if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
          }
          // Handle Auth.js errors
          if (error instanceof AuthError) {
            return {
              error:
                error.type === 'CredentialsSignin'
                  ? 'Invalid credentials.'
                  : 'An error with Auth.js occurred.',
              type: error.type,
            };
          }
          // An error boundary must exist to handle unknown errors
          return {
            error: 'Something went wrong.',
            type: 'UnknownError',
          };
        }
      }}
    />
  );
}`;

export const readmeContent = `
# Create Toolpad App

This is a [Next.js](https://nextjs.org/) project bootstrapped with [\`create-toolpad-app\`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server: \`npm run dev\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
`;
