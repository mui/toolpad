---
title: Toolpad Core - Integration
description: How to integrate Toolpad Core into your existing project.
---

# Integration

This guide will walk you through the process of adding Toolpad Core to an existing project.

## Installation

<codeblock storageKey="package-manager">

```bash npm
npm install -S @toolpad/core
```

```bash yarn
yarn add @toolpad/core
```

```bash pnpm
pnpm add @toolpad/core
```

</codeblock>

## Next.js App Router

Use the following steps to integrate Toolpad Core into your Next.js app:

### 1. Wrap your application with `AppProvider`

In your root layout file (e.g., `app/layout.tsx`), wrap your application with the `AppProvider`:

```tsx title="app/layout.tsx"
import { AppProvider } from '@toolpad/core';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <AppProvider navigation={NAVIGATION} branding={BRANDING}>
        {children}
      </AppProvider>
    </AppRouterCacheProvider>
  );
}
```

You can find details on the `AppProvider` props on the [AppProvider](/toolpad/core/react-app-provider/) page.

:::info
The `AppRouterCacheProvider` component is not required to use Toolpad Core, but it's recommended to use it to ensure that the styles are appended to the `<head>` and not rendering in the `<body>`.

See the [Material UI Next.js integration docs](https://mui.com/material-ui/integrations/nextjs/) for more details.
:::

### 2. Create a dashboard layout

Create a layout file for your dashboard pages (e.g., `app/(dashboard)/layout.tsx`):

```tsx title="app/(dashboard)/layout.tsx"
import * as React from 'react';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';

export default function DashboardPagesLayout(props: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <PageContainer>{props.children}</PageContainer>
    </DashboardLayout>
  );
}
```

The [`DashboardLayout`](/toolpad/core/react-dashboard-layout/) component provides a consistent layout for your dashboard pages, including a sidebar, navigation, and header. The [`PageContainer`](/toolpad/core/react-page-container/) component is used to wrap the page content, and provides breadcrumbs for navigation.

### 3. Create a dashboard page

Now you can create pages within your dashboard. For example, a home page (`app/(dashboard)/page.tsx`):

```tsx title="app/(dashboard)/page.tsx"
import * as React from 'react';
import Typography from '@mui/material/Typography';

export default function Page() {
  return <Typography>Welcome to a page in the dashboard!</Typography>;
}
```

That's it! You have now integrated Toolpad Core into your Next.js app.

### 4. (Optional) Add a second page

Create a new page in the dashboard, for example, `app/(dashboard)/orders/page.tsx`:

```tsx title="app/(dashboard)/orders/page.tsx"
import * as React from 'react';
import Typography from '@mui/material/Typography';

export default function OrdersPage() {
  return <Typography>Welcome to the orders page!</Typography>;
}
```

To add this page to the navigation, add it to the `NAVIGATION` variable:

```ts title="app/layout.tsx"
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

### 5. (Optional) Set up authentication

If you want to add authentication, you can use Auth.js with Toolpad Core. Here's an example setup:

#### a. Install the dependencies

```bash
npm install next-auth@beta
```

#### b. Create an `auth.ts` file

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
```

#### c. Create a sign-in page

Use the `SignInPage` component to add a sign-in page to your app. For example, `app/auth/signin/page.tsx`:

```tsx title="app/auth/signin/page.tsx"
import * as React from 'react';
import type { AuthProvider } from '@toolpad/core';
import { SignInPage } from '@toolpad/core/SignInPage';
import { AuthError } from 'next-auth';
import { providerMap, signIn } from '../../../auth';

export default function SignIn() {
  return (
    <SignInPage
      providers={providerMap}
      signIn={async (
        provider: AuthProvider,
        formData: FormData,
        callbackUrl?: string,
      ) => {
        'use server';
        try {
          return await signIn(provider.id, {
            redirectTo: callbackUrl ?? '/',
          });
        } catch (error) {
          // The desired flow for successful sign in in all cases
          // and unsuccessful sign in for OAuth providers will cause a `redirect`,
          // and `redirect` is a throwing function, so we need to re-throw
          // to allow the redirect to happen
          // Source: https://github.com/vercel/next.js/issues/49298#issuecomment-1542055642
          // Detect a `NEXT_REDIRECT` error and re-throw it
          if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
          }
          // Handle Auth.js errors
          if (error instanceof AuthError) {
            return {
              error: error.message,
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
}
```

#### d. Create a route handler for sign-in

`next-auth` requires a route handler for sign-in. Create a file `app/api/auth/[...nextauth]/route.ts`:

```ts title="app/api/auth/[...nextauth]/route.ts"
import { handlers } from '../../../../auth';

export const { GET, POST } = handlers;
```

#### e. Add a middleware

Add a middleware to your app to protect your dashboard pages:

```ts title="middleware.ts"
export { auth as middleware } from './auth';

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
```

That's it! You now have Toolpad Core integrated into your Next.js App Router app with authentication setup:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/core/integration-nextjs-app.png", "srcDark": "/static/toolpad/docs/core/integration-nextjs-app-dark.png", "alt": "Next.js App Router with Toolpad Core", "caption": "Next.js App Router with Toolpad Core", "zoom": true, "aspectRatio": "1.428" }}

:::info
For a full working example with authentication included, see the [Toolpad Core Next.js App with Auth.js example](https://github.com/mui/toolpad/tree/master/examples/core-auth-nextjs)
:::

## Next.js Pages Router

To integrate Toolpad Core into your Next.js Pages Router app, follow these steps:

### 1. Wrap your application with `AppProvider`

In your root layout file (e.g., `pages/_app.tsx`), wrap your application with the `AppProvider`:

```tsx title="pages/_app.tsx"
import * as React from 'react';
import { AppProvider } from '@toolpad/core/nextjs';
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
      <AppProvider navigation={NAVIGATION} branding={BRANDING}>
        <DashboardLayout>
          <PageContainer>
            <Component />
          </PageContainer>
        </DashboardLayout>
      </AppProvider>
    </AppCacheProvider>
  );
}
```

:::info
The `AppCacheProvider` component is not required to use Toolpad Core, but it's recommended.

See the [Material UI Next.js Pages Router integration docs](https://mui.com/material-ui/integrations/nextjs/#configuration-2) for more details.
:::

### 2. Modify `_document.tsx`

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

### 3. Add a dashboard page

Create a dashboard page (e.g., `pages/index.tsx`):

```tsx title="pages/index.tsx"
import * as React from 'react';
import Typography from '@mui/material/Typography';

export default function HomePage() {
  return <Typography>Welcome to Toolpad!</Typography>;
}
```

### 4. (Optional) Add a second page

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

### 5. (Optional) Set up authentication

If you want to add authentication, you can use Auth.js with Toolpad Core. Here's an example setup:

#### a. Install the dependencies

```bash
npm install next-auth@beta
```

#### b. Create an `auth.ts` file

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

#### c. Modify `_app.tsx`

Modify `_app.tsx` to include the `authentication` prop and other helpers:

```tsx title="pages/_app.tsx"
import * as React from 'react';
import { AppProvider } from '@toolpad/core/nextjs';
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
      <AppProvider
        navigation={NAVIGATION}
        branding={BRANDING}
        session={session}
        authentication={AUTHENTICATION}
      >
        {children}
      </AppProvider>
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

#### d. Create a sign-in page

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

#### e. Create a route handler for sign-in

`next-auth` requires a route handler for sign-in. Create a file `app/api/auth/[...nextauth].ts`:

```ts title="app/api/auth/[...nextauth].ts"
import { handlers } from '../../../../auth';

export const { GET, POST } = handlers;
```

:::warning

Note that this file is a route handler and must be placed in the `app` directory, even if the rest of your app is in the `pages` directory. Know more in the [Auth.js documentation](https://authjs.dev/getting-started/installation#configure).

:::

#### f. Add a middleware

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
For a full working example with authentication included, see the [Toolpad Core Next.js Pages app with Auth.js example](https://github.com/mui/toolpad/tree/master/examples/core-auth-nextjs-pages)
:::
