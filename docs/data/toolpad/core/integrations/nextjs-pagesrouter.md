---
title: Next.js - Integration
---

# Next.js Pages Router

<p class="description">This guide walks you through adding Toolpad Core to an existing Next.js app.</p>

## Prerequisites

Ensure that you have `@mui/material` and `next` installed. You also need the following to make the integration work correctly:

<codeblock storageKey="package-manager">

```bash npm
npm install @mui/material-nextjs @emotion/cache
```

```bash pnpm
pnpm add @mui/material-nextjs @emotion/cache
```

```bash yarn
yarn add install @mui/material-nextjs @emotion/cache
```

</codeblock>

## Wrap your application with `NextAppProvider`

In your root layout file (for example, `pages/_app.tsx`), wrap your application with the `NextAppProvider`:

```tsx title="pages/_app.tsx"
import * as React from 'react';
import { NextAppProvider } from '@toolpad/core/nextjs';
import { PageContainer } from '@toolpad/core/PageContainer';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import Head from 'next/head';
import { AppCacheProvider } from '@mui/material-nextjs/v14-pagesRouter';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import type { Navigation } from '@toolpad/core/AppProvider';

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

export default function App({ Component }: { Component: React.ElementType }) {
  return (
    <AppCacheProvider>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <NextAppProvider navigation={NAVIGATION} branding={BRANDING}>
        <DashboardLayout>
          <PageContainer>
            <Component />
          </PageContainer>
        </DashboardLayout>
      </NextAppProvider>
    </AppCacheProvider>
  );
}
```

:::info
The `AppCacheProvider` component is not required to use Toolpad Core, but it's recommended.

See the [Material UI Next.js Pages Router integration docs](https://mui.com/material-ui/integrations/nextjs/#configuration-2) for more details.
:::

## Modify `_document.tsx`

Modify `_document.tsx` to include the `DocumentHeadTags` component:

```tsx title="pages/_document.tsx"
import * as React from 'react';
import {
  Html,
  Head,
  Main,
  NextScript,
  DocumentProps,
  DocumentContext,
} from 'next/document';
import {
  DocumentHeadTags,
  DocumentHeadTagsProps,
  documentGetInitialProps,
} from '@mui/material-nextjs/v14-pagesRouter';

export default function Document(props: DocumentProps & DocumentHeadTagsProps) {
  return (
    <Html lang="en" data-toolpad-color-scheme="light">
      <Head>
        <meta name="emotion-insertion-point" content="" />
        <DocumentHeadTags {...props} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

Document.getInitialProps = async (ctx: DocumentContext) => {
  const finalProps = await documentGetInitialProps(ctx);
  return finalProps;
};
```

## Add a dashboard page

Create a dashboard page (for example, `pages/index.tsx`):

```tsx title="pages/index.tsx"
import * as React from 'react';
import Typography from '@mui/material/Typography';

export default function HomePage() {
  return <Typography>Welcome to Toolpad!</Typography>;
}
```

## (Optional) Add a second page

Create a new page in the dashboard, for example, `pages/orders/index.tsx`:

```tsx title="pages/orders/index.tsx"
import * as React from 'react';
import Typography from '@mui/material/Typography';

export default function OrdersPage() {
  return <Typography>Welcome to the orders page!</Typography>;
}
```

To add this page to the navigation, add it to the `NAVIGATION` variable:

```ts title="pages/_app.tsx"
export const NAVIGATION = [
  // ...
  {
    segment: 'orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
  },
  // ...
];
```

## (Optional) Set up authentication

If you want to add authentication, you can use Auth.js with Toolpad Core. Here's an example setup:

### Install the dependencies

```bash
npm install next-auth@beta
```

### Create an `auth.ts` file

```ts title="auth.ts"
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import type { Provider } from 'next-auth/providers';

const providers: Provider[] = [
  GitHub({
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  }),
];

export const providerMap = providers.map((provider) => {
  if (typeof provider === 'function') {
    const providerData = provider();
    return { id: providerData.id, name: providerData.name };
  }
  return { id: provider.id, name: provider.name };
});

export const { handlers, auth } = NextAuth({
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
```

### Modify `_app.tsx`

Modify `_app.tsx` to include the `authentication` prop and other helpers:

```tsx title="pages/_app.tsx"
import * as React from 'react';
import { NextAppProvider } from '@toolpad/core/nextjs';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import Head from 'next/head';
import { AppCacheProvider } from '@mui/material-nextjs/v14-pagesRouter';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import type { Navigation } from '@toolpad/core/AppProvider';
import { SessionProvider, signIn, signOut, useSession } from 'next-auth/react';
import LinearProgress from '@mui/material/LinearProgress';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
  requireAuth?: boolean;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

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
  {
    segment: 'orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
  },
];

const BRANDING = {
  title: 'My Toolpad Core App',
};

const AUTHENTICATION = {
  signIn,
  signOut,
};

function getDefaultLayout(page: React.ReactElement) {
  return (
    <DashboardLayout>
      <PageContainer>{page}</PageContainer>
    </DashboardLayout>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status === 'loading') {
    return <LinearProgress />;
  }

  return children;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  return (
    <React.Fragment>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <NextAppProvider
        navigation={NAVIGATION}
        branding={BRANDING}
        session={session}
        authentication={AUTHENTICATION}
      >
        {children}
      </NextAppProvider>
    </React.Fragment>
  );
}

export default function App(props: AppPropsWithLayout) {
  const {
    Component,
    pageProps: { session, ...pageProps },
  } = props;

  const getLayout = Component.getLayout ?? getDefaultLayout;
  const requireAuth = Component.requireAuth ?? true;

  let pageContent = getLayout(<Component {...pageProps} />);
  if (requireAuth) {
    pageContent = <RequireAuth>{pageContent}</RequireAuth>;
  }
  pageContent = <AppLayout>{pageContent}</AppLayout>;

  return (
    <AppCacheProvider {...props}>
      <SessionProvider session={session}>{pageContent}</SessionProvider>
    </AppCacheProvider>
  );
}
```

### Create a sign-in page

Use the `SignInPage` component to add a sign-in page to your app. For example, `pages/auth/signin.tsx`:

```tsx title="pages/auth/signin.tsx"
import * as React from 'react';
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import Link from '@mui/material/Link';
import { SignInPage } from '@toolpad/core/SignInPage';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { auth, providerMap } from '../../auth';

export default function SignIn({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  return (
    <SignInPage
      providers={providers}
      signIn={async (provider, formData, callbackUrl) => {
        try {
          const signInResponse = await signIn(provider.id, {
            callbackUrl: callbackUrl ?? '/',
          });
          if (signInResponse && signInResponse.error) {
            // Handle Auth.js errors
            return {
              error: signInResponse.error.message,
              type: signInResponse.error,
            };
          }
          return {};
        } catch (error) {
          // An error boundary must exist to handle unknown errors
          return {
            error: 'Something went wrong.',
            type: 'UnknownError',
          };
        }
      }}
    />
  );
}

SignIn.getLayout = (page: React.ReactNode) => page;

SignIn.requireAuth = false;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await auth(context);

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: '/' } };
  }

  return {
    props: {
      providers: providerMap,
    },
  };
}
```

### Create a route handler for sign-in

`next-auth` requires a route handler for sign-in. Create a file `app/api/auth/[...nextauth].ts`:

```ts title="app/api/auth/[...nextauth].ts"
import { handlers } from '../../../../auth';

export const { GET, POST } = handlers;
```

:::warning

Note that this file is a route handler and must be placed in the `app` directory, even if the rest of your app is in the `pages` directory. Know more in the [Auth.js documentation](https://authjs.dev/getting-started/installation#configure).

:::

#### Add a middleware

Add a middleware to your app to protect your dashboard pages:

```ts title="middleware.ts"
export { auth as middleware } from './auth';

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
```

That's it! You now have Toolpad Core integrated into your Next.js Pages Router app with authentication setup:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/core/integration-nextjs-pages.png", "srcDark": "/static/toolpad/docs/core/integration-nextjs-pages-dark.png", "alt": "Next.js Pages Router with Toolpad Core", "caption": "Next.js Pages Router with Toolpad Core", "zoom": true, "aspectRatio": "1.428" }}

:::info
For a full working example with authentication included, see the [Toolpad Core Next.js Pages app with Auth.js example](https://github.com/mui/toolpad/tree/master/examples/core/auth-nextjs-pages/)
:::
