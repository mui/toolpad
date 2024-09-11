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

1. In your root layout file (e.g., `app/layout.tsx`), wrap your application with the `AppProvider`:

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

You can find details on the `AppProvider` props in the [base concepts](/toolpad/core/introduction/base-concepts/#app-provider) section. The [Material UI Next.js App Router integration](https://mui.com/material-ui/integrations/nextjs/) has more details on the `AppRouterCacheProvider`.

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

#### b. Create an `auth.ts` file:

```ts title="auth.ts"
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

:::warning

This file is only for demonstration purposes and allows signing in with `password` as the password. You should use a more secure method for authentication in a production environment, preferably OAuth with your own `CLIENT_ID` and `CLIENT_SECRET`. Find more details on to get these values in the [NextAuth documentation](https://authjs.dev/guides/configuring-github).

:::

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
            ...(formData && {
              email: formData.get('email'),
              password: formData.get('password'),
            }),
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

That's it! You now have a fully functional authentication setup for your Next.js app.
