---
productId: toolpad-core
title: Sign-in Page
components: SignInPage, Account, NotificationsProvider
---

# Sign-in Page

<p class="description">A customizable sign-in UI component that abstracts away the pain needed to wire together a secure authentication page for your application.</p>

:::info
If this is your first time using Toolpad Core, it's recommended to read about the [basic concepts](/toolpad/core/introduction/base-concepts/) first.
:::

The `SignInPage` component is a quick way to generate a ready-to-use authentication page with multiple OAuth providers, or a credentials form.

## OAuth

The `SignInPage` component can be set up with an OAuth provider by passing in a list of providers in the `providers` prop, along with a `signIn` function that accepts the `provider` as a parameter.

{{"demo": "OAuthSignInPage.js", "iframe": true, "height": 600}}

:::info

The following OAuth providers are supported and maintained by default:

- Google
- GitHub
- Facebook
- Microsoft (Entra ID)
- Apple
- Auth0
- AWS Cognito
- GitLab
- Instagram
- LINE
- Okta
- FusionAuth
- Twitter
- TikTok
- LinkedIn
- Slack
- Spotify
- Twitch
- Discord
- Keycloak

Find details on how to set up each provider in the [Auth.js documentation](https://authjs.dev/getting-started/authentication/oauth).
:::

## Magic Link

The `SignIn` page component supports magic links. To enable this, you have to set up a provider such as Auth.js NodeMailer. See more details in the Auth.js docs on [database setup for email](https://authjs.dev/getting-started/authentication/email) and [Nodemailer configuration](https://authjs.dev/getting-started/providers/nodemailer).

To render a magic link form, pass in a provider with `nodemailer` as the `id` property.

:::info
The `SignInPage` component can display a success alert if the email is sent successfully. You can enable this by passing a `success` property in the
response object of the `signIn` prop.
:::

{{"demo": "MagicLinkAlertSignInPage.js", "iframe": true, "height": 450}}

:::info
Check out the complete [Next.js Auth.js Magic Link example](https://github.com/mui/mui-toolpad/tree/master/examples/core/auth-nextjs-email/) example for a working implementation of a magic link sign-in page with Auth.js, Nodemailer, Prisma and PostgreSQL.
:::

## Passkey

The `SignInPage` component can be set up to use [Passkeys](https://passkeys.dev) by passing in a provider with `passkey` as the `id`:

{{"demo": "PasskeySignInPage.js", "iframe": true}}

:::info
The [Toolpad Core Passkey example app](https://github.com/mui/mui-toolpad/tree/master/examples/core/auth-nextjs-passkey/) comes with a working app using `next-auth/webauthn`, Prisma and PostgreSQL.
:::

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/core/auth-next-passkey.png", "srcDark": "/static/toolpad/docs/core/auth-next-passkey-dark.png", "alt": "Auth.js Passkeys & Next.js with Toolpad Core sign-in page", "caption": "Auth.js Passkeys & Next.js App Router with Toolpad Core Sign-in page", "zoom": true,  "aspectRatio": "1.428" }}

## Credentials

:::warning
The Credentials provider is not the most secure way to authenticate users. It's recommended to use any of the other providers for a more robust solution.
:::

To render a username password form, pass in a provider with `credentials` as the `id` property. The `signIn` function accepts a `formData` parameter in this case.

{{"demo": "CredentialsSignInPage.js", "iframe": true, "height": 600}}

### Alerts

The `signIn` prop takes a function which can either return `void` or a `Promise` which resolves with an `AuthResponse` object of the form:

```ts
interface AuthResponse {
  error?: string;
  type?: string;
}
```

This renders an alert with the `error` string as the message.

{{"demo": "NotificationsSignInPageError.js", "iframe": true, "height": 600}}

## Usage with authentication libraries

### Auth.js

#### Next.js App Directory and GitHub

The component is composable with any authentication library you might want to use. The following is a `SignInPage` with [Auth.js](https://authjs.dev/) using GitHub, Next.js App Router and server actions.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/core/auth-next.png", "srcDark": "/static/toolpad/docs/core/auth-next-dark.png", "alt": "Auth.js & Next.js with Toolpad Core sign-in page", "caption": "Auth.js & Next.js App Router with Toolpad Core Sign-in page", "zoom": true, "indent": 1, "aspectRatio": "1.428" }}

#### Setting up

If you're using [`create-toolpad-app`](/toolpad/core/introduction/installation/), or the [Next.js app directory example](https://github.com/mui/toolpad/tree/master/examples/core/auth-nextjs/), Auth.js is already installed. To proceed, add `AUTH_SECRET` to the environment variables by running:

```bash
npx auth secret
```

Otherwise, follow the detailed [Auth.js installation instructions](https://authjs.dev/getting-started/installation).

##### GitHub configuration

To get the required credentials, create an application in the GitHub developer settings. Read this [guide on Auth.js](https://authjs.dev/guides/configuring-github#adding-environment-variables) on how to obtain those.

If you already have a `CLIENT_ID` and `CLIENT_SECRET`, you can skip this step and add them to the environment variables, like so:

```bash title=".env.local"
GITHUB_CLIENT_ID=<your-client-id>
GITHUB_CLIENT_SECRET=<your-client-secret>
```

##### Server Configuration

If you're using [`create-toolpad-app`](/toolpad/core/introduction/installation/), or the default [Next.js app directory example](https://github.com/mui/toolpad/tree/master/examples/core/auth-nextjs/), this server configuration is already set up for you.

Otherwise, follow the [custom sign in page instructions](https://authjs.dev/guides/pages/signin) to set up the server configuration.

The `SignInPage` component can slot in as a custom sign-in page inside Auth.js:

```ts title="./auth.ts"
// ...
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/auth/signin', // you can customize this based on your requirement
  },
// ...
```

To have a fully built "Sign in with GitHub" page appear at the `/auth/signin` route, add `SignInPage` to `page.tsx`:

```tsx title="./app/auth/signin/page.tsx"
// ...
import * as React from 'react';
import { SignInPage, type AuthProvider } from '@toolpad/core/SignInPage';
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
          if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
          }
          if (error instanceof AuthError) {
            return {
              error:
                error.type === 'CredentialsSignin'
                  ? 'Invalid credentials.'
                  : 'An error with Auth.js occurred.',
              type: error.type,
            };
          }
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

:::success
If you're using the default [Next.js example](https://github.com/mui/toolpad/tree/master/examples/core/auth-nextjs/), all of this is already configured for you. Otherwise, follow the [custom sign-in page instructions](https://authjs.dev/guides/pages/signin).
:::

:::info
If you're not on the Next Auth v5 version yet, see the [example with Next Auth v4](https://github.com/mui/toolpad/tree/master/examples/core/auth-nextjs-pages-nextauth-4/) to get started.
:::

### Firebase

#### Vite with React Router

##### Setting up

You need to create a `.env` file in the root of your project directory with the following environment variables:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGE_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

:::info
Head to the [Firebase docs](https://firebase.google.com/docs/auth/) for details around configuring authentication with Firebase. You can also find code examples in the [integration docs for Vite & React Router](https://mui.com/toolpad/core/integrations/react-router/).
:::

:::success
If you're using [create-toolpad-app](/toolpad/core/introduction/installation/), or the default [Vite with Firebase authentication example](https://github.com/mui/toolpad/tree/master/examples/core/firebase-vite/), the integration code is already provided.
:::

## Customization

### Branding

You can add your own branding elements to the `SignInPage` through the `branding` prop in the [AppProvider](https://mui.com/toolpad/core/react-app-provider/):

{{"demo": "BrandingSignInPage.js", "iframe": true, "height": 600 }}

### Theme

Through the `theme` prop in the [AppProvider](https://mui.com/toolpad/core/react-app-provider/), the `SignInPage` can be deeply customized to match any theme:

{{"demo": "ThemeSignInPage.js", "iframe": true, "height": 700 }}

:::info
Find a full-fledged example using the Next.js App Router, Auth.js and this theme [here](https://codesandbox.io/p/sandbox/github/mui/toolpad/tree/master/examples/core/auth-nextjs-themed).
:::

### Slots

To enable deep customization beyond what is possible with custom props, the `SignInPage` component allows bringing your own custom granular components, such as inputs, checkboxes and buttons.

{{"demo": "SlotsSignIn.js", "iframe": true, "height": 540 }}

You can use the `slotProps` prop to pass props to the underlying components of each slot:

{{"demo": "SlotPropsSignIn.js", "iframe": true, "height": 600 }}

### 🚧 Layouts

The `SignInPage` component has versions with different layouts for authentication - one column, two column and others such. The APIs of these components are identical. This is in progress.

## 🚧 Other authentication flows

Besides the `SignInPage` , the team is planning work on several other components that enable new workflows such as [sign up](https://github.com/mui/toolpad/issues/4068) and [password reset](https://github.com/mui/toolpad/issues/4265).
