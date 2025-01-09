---
productId: toolpad-core
title: Sign-up Page
components: SignUpPage
---

# Sign-up Page

<p class="description">A customizable sign-up UI component that abstracts away the pain needed to wire together a secure authentication page for your application.</p>

:::info
If this is your first time using Toolpad Core, it's recommended to read about the [basic concepts](/toolpad/core/introduction/base-concepts/) first.
:::

The `SignUpPage` component is a quick way to generate a ready-to-use registration page with multiple OAuth providers, or a credentials form.

## OAuth

The `SignUpPage` component can be set up with an OAuth provider by passing in a list of providers in the `providers` prop, along with a `signUp` function that accepts the `provider` as a parameter.

{{"demo": "OAuthSignUpPage.js", "iframe": true, "height": 600}}

:::info
The same OAuth providers supported by SignInPage are available for SignUpPage. See the [Auth.js documentation](https://authjs.dev/getting-started/authentication/oauth) for setup details.
:::

## Credentials

To render a registration form with email/password, pass in a provider with `credentials` as the `id` property. The `signUp` function accepts a `formData` parameter in this case.

{{"demo": "CredentialsSignUpPage.js", "iframe": true, "height": 500}}

## Usage with authentication libraries

### Firebase

The component is composable with any authentication library. Here's an example using Firebase with Vite:

#### Setup

To use Firebase as your authentication library, you need to setup a new Firebase project and obtain the following environment variables from your project console:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGE_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Visit the [Firebase docs](https://firebase.google.com/docs/auth) for more details on setting up and adding authentication to your project.

#### Usage

```tsx title="src/pages/signup.tsx"
'use client';
import * as React from 'react';

import Link from '@mui/material/Link';
import LinearProgress from '@mui/material/LinearProgress';
import { SignUpPage } from '@toolpad/core/SignUpPage';
import { Navigate, useNavigate, useLocation } from 'react-router';
import { useSession, type Session } from '../SessionContext';
import { signUpWithCredentials } from '../firebase/auth';

export default function SignUp() {
  const { session, setSession, loading } = useSession();
  const [completing, setCompleting] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return <LinearProgress />;
  }

  if (session) {
    return <Navigate to="/" />;
  }

  return (
    <SignUpPage
      providers={[{ id: 'credentials', name: 'Email and Password' }]}
      signUp={async (provider, formData, callbackUrl) => {
        let result;
        try {
          if (provider.id === 'credentials') {
            const email = formData?.get('email') as string;
            const password = formData?.get('password') as string;

            if (!email || !password) {
              return { error: 'Email and password are required' };
            }

            result = await signUpWithCredentials(email, password);
          }
          if (result?.success && result?.user) {
            // Convert Firebase user to Session format
            const userSession: Session = {
              user: {
                name: result.user.displayName || '',
                email: result.user.email || '',
                image: result.user.photoURL || '',
              },
            };
            setSession(userSession);
            navigate(callbackUrl || '/', { replace: true });
            return {};
          }
          return { error: result?.error || 'Failed to sign in' };
        } catch (error) {
          return {
            error: error instanceof Error ? error.message : 'An error occurred',
          };
        }
      }}
    />
  );
}
```

:::info
The [Firebase Vite example app](https://github.com/mui/mui-toolpad/tree/master/examples/core/firebase-vite/) comes with a working app using Firebase including both `SignUpPage` and `SignInPage` flows.
:::

## Customization

### Branding

You can add your own branding elements through the `branding` prop in the AppProvider:

{{"demo": "BrandingSignUpPage.js", "iframe": true, "height": 600 }}

### Theme

The `SignUpPage` can be deeply customized to match any theme through the AppProvider's theme prop:

{{"demo": "ThemeSignUpPage.js", "iframe": true, "height": 700 }}

### Slots

To enable deep customization, the `SignUpPage` component allows bringing your own custom granular components:

<!-- {{"demo": "SlotsSignUp.js", "iframe": true, "height": 540 }} -->

You can use the `slotProps` prop to pass props to the underlying components of each slot:

<!-- {{"demo": "SlotPropsSignUp.js", "iframe": true, "height": 600 }} -->

### 🚧 Layouts

The `SignUpPage` component will support different layouts for authentication - one column, two column and others. The APIs of these components will be identical. This is in progress.

## 🚧 Other authentication flows

Besides the `SignUpPage`, the team is planning work on several other components that enable new workflows such as [forgot password](https://github.com/mui/toolpad/issues/4265) and [one-time code verification](https://github.com/mui/toolpad/issues/4292).
