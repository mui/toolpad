import { Template } from '../../../types';

const signInPage: Template = (options) => {
  const { hasPasskeyProvider } = options;

  return `${hasPasskeyProvider ? "'use client';" : ''}
  import * as React from 'react';
import { SignInPage, type AuthProvider } from '@toolpad/core/SignInPage';
import { AuthError } from 'next-auth';
${hasPasskeyProvider ? "import { signIn as webauthnSignIn } from 'next-auth/webauthn';" : ''}
import { providerMap } from '../../../auth';
${hasPasskeyProvider ? `import serverSignIn from './actions';` : `import signIn from './actions;`}

${
  hasPasskeyProvider
    ? `const signIn = async (provider: AuthProvider, formData: FormData, callbackUrl?: string) => {
  if (provider.id === 'passkey') {
    try {
      return await webauthnSignIn('passkey', {
        email: formData.get('email'),
        callbackUrl: callbackUrl || '/',
      });
    } catch (error) {
      console.error(error);
      return {
        error: (error as Error)?.message || 'Something went wrong',
        type: 'WebAuthnError',
      };
    }
  }
  // Use server action for other providers
  return serverSignIn(provider, formData, callbackUrl);
};`
    : ''
}

export default function SignIn() {
  return (
    <SignInPage
      providers={providerMap}
      signIn={signIn}
    />
  );
}`;
};

export default signInPage;
