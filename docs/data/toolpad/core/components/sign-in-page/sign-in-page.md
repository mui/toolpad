---
productId: toolpad-core
title: Sign In Page
components: SignInPage, Account, NotificationsProvider
---

# Sign In Page

<p class="description">A component that renders a functional authentication page for your application.</p>

The `SignInPage` component is a quick way to generate a ready-to-use authentication page with multiple OAuth providers, or a credentials form.

## OAuth

The `SignInPage` component can be set up with an OAuth provider by passing in a list of providers in the `providers` prop, along with a `signIn` function that accepts the `provider` as a parameter.

{{"demo": "OAuthSignInPage.js", "iframe": true}}

## Credentials

:::warning
It is recommended to use the OAuth provider for more robust maintenance, support and security.
:::

To render a username password form, pass in a provider with `credentials` as the `id` property. The `signIn` function will accept a `formData` parameter in this case.

{{"demo": "CredentialsSignInPage.js", "iframe": true, "height": 500}}

### Alerts

The `signIn` prop takes a function which can either return `void` or a `Promise` which resolves with an `AuthResponse` object of the form:

```ts
interface AuthResponse {
  error?: string;
  type?: string;
}
```

This will render an alert with the `error` string as the message.

{{"demo": "NotificationsSignInPageError.js", "iframe": true, "height": 600}}

## Usage with authentication libraries

### Auth.js

#### Next.js App Directory and GitHub

The component is composable with any authentication library you might want to use. The following is a functional `SignInPage` with [auth.js](https://authjs.dev/) using GitHub, Next.js App router and server actions.

:::warning
The following demo will not initiate an actual GitHub authentication flow, since doing that from within an `iframe` is not permitted. Run the [Next.js app directory](https://github.com/mui/mui-toolpad/tree/master/examples/core-auth-nextjs/) example to test this functionality.
:::

{{"demo": "AuthJsSignInApp.js", "iframe": true, "height": 300 }}

#### Setting up

The project contains an `.env.local` with the following variables:

```bash
AUTH_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
```

You must pass values to them before running this project.

##### AUTH_SECRET

`AUTH_SECRET` is a random value used by the Auth.js to encrypt tokens and email verification hashes. (See [Auth.js Deployment documentation](https://authjs.dev/getting-started/deployment) to learn more). You can generate one via running:

```bash
npx auth secret
```

##### GitHub configuration

| environment variable name &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | description                     |
| :------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------ |
| `AUTH_GITHUB_ID`                                                                                                                                         | GitHub OAuth app client ID.     |
| `AUTH_GITHUB_SECRET`                                                                                                                                     | GitHub OAuth app client secret. |

To get the required credentials from GitHub, we need to create an application in their developer settings. Read this [guide on Auth.js](https://authjs.dev/guides/configuring-github) on how to obtain those.

Use our detailed examples with both the [Next.js app directory](https://github.com/mui/mui-toolpad/tree/master/examples/core-auth-nextjs/) and [pages directory](https://github.com/mui/mui-toolpad/tree/master/examples/core-auth-nextjs-pages/) to get started using Auth.js with Toolpad Core.

## Customization

### Theme and Branding

Through the `branding` and `theme` props in the [AppProvider](https://mui.com/toolpad/core/react-app-provider/), the `SignInPage` can be customized to match your own styles.

{{"demo": "BrandingSignInPage.js", "iframe": true, "height": 700 }}

### Components

`SignInPage` can be customized by passing in `slotProps` to the underlying components of the credentials form.

{{"demo": "SlotPropsSignIn.js", "iframe": true, "height": 540 }}

#### 🚧 Composition

To enable deep customization beyond what is possible with custom props, the `SignInPage` component will allow bringing your own custom granular components, such as inputs and buttons. This is in progress.

### 🚧 Layouts

The `SignInPage` component will have versions with different layouts for authentication - one column, two column and others such. The APIs of these components will be identical. This is in progress.
