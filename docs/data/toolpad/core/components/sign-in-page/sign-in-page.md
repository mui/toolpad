---
productId: toolpad-core
title: Sign In Page
components: SignInPage, Account
---

# Sign In Page

<p class="description">A component that renders a functional authentication page for your application.</p>

The `SignInPage` component is a quick way to generate a ready-to-use authentication page with multiple OAuth providers, or a credentials form.

## OAuth

The `SignInPage` component can be set up with an OAuth provider by passing in a list of providers in the `providers` prop, along with a `signIn` function that accepts the `provider` as a parameter.

{{"demo": "OAuthSignInPage.js"}}

## Credentials

To render a username password form, pass in a provider with `credentials` as the `id` property. The `signIn` function will accept a `formData` parameter in this case.

{{"demo": "CredentialsSignInPage.js"}}

## Usage with authentication libraries

### Auth.js

#### Next.js App Directory

The component is composable with any authentication library you might want to use. The following is a functional `SignInPage` with [auth.js](https://authjs.dev/) using the Next.js App router and Server actions:

{{"demo": "AuthJsSignInApp.js"}}

Use our detailed examples with both the [Next.js app directory](https://github.com/mui/mui-toolpad/tree/master/playground/nextjs) and [pages directory](https://github.com/mui/mui-toolpad/tree/master/playground/nextjs-pages) to get started using Auth.js with Toolpad Core.

## Customization

### Theme and Branding

Through the `branding` and `theme` props in the [AppProvider](https://mui.com/toolpad/core/react-app-provider/), the `SignInPage` can be customized to match your own branding.

{{"demo": "BrandingSignInPage.js", "iframe": true }}

### 🚧 Slots

The `SignInPage` component will allow passing in custom forms when using the `credentials` provider. This is in progress.

### 🚧 Layouts

The `SignInPage` component will have versions with different layouts for authentication - one column, two column and others such. The APIs of these components will be identical. This is in progress.
