---
productId: toolpad-core
title: Sign-up Page
components: SignUpPage
---

# Sign-up Page 🚧

<p class="description">A customizable sign-up component that abstracts away the pain needed to wire together a secure sign-up/register page for your application.</p>

:::info
If this is your first time using Toolpad Core, it's recommended to read about the [basic concepts](/toolpad/core/introduction/base-concepts/) first.
:::

:::warning
This feature is currently experimental and may change in future releases.
:::

The `SignUpPage` component is a quick way to generate a ready-to-use registration page with multiple OAuth providers, or a credentials from.

## Basic Usage

```tsx
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignUpPage } from '@toolpad/core/SignUpPage';

export default function App() {
  return (
    <AppProvider>
      <SignUpPage
        providers={[...]}
        signUp={async (provider) => {
          // Your sign in logic
        }}
      />
    </AppProvider>
  );
}
```

## OAuth

:::warning

This function uses the same logic as the sign-in flow, but instead of authenticating an existing user, it creates a new user account with the selected provider. Make sure your `signUp` function handles user creation and any required validation or error handling for a smooth registration experience.

:::

The `SignUpPage` component can be set up with an OAuth provider by passing in a list of providers in the `providers` prop, along with a `signUp` function that accepts the `provider` as a parameter.

{{"demo": "OAuthSignUpPage.js", "iframe": true, "height": 600}}

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

## Credentials

:::warning
The Credentials provider is not the most secure way to authenticate users. It's recommended to use any of the other providers for a more robust solution.
:::

To use the Credentials provider, add it to the `providers` array and implement your own sign-up logic.

{{"demo": "CredentialsSignUpPage.js", "iframe": true, "height": 600}}

### Alerts

The `signUp` prop takes a function which can either return `void` or a `Promise` which resolves with an `SignUpActionResponse` object of the form:

```ts
interface SignUpActionResponse {
  error?: string;
  success?: string;
}
```

{{"demo": "NotificationsSignUpPageError.js", "iframe": true, "height": 600}}

This renders an alert with the `error` string as the message.
