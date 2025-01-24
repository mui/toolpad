import { Template } from '../../../../types';

const signInPage: Template = (options) => {
  const { hasPasskeyProvider, hasNodemailerProvider } = options;

  return `${hasPasskeyProvider ? "'use client';" : ''}
  import * as React from 'react';
import { SignInPage } from '@toolpad/core/SignInPage';
${hasPasskeyProvider ? "import { signIn as webauthnSignIn } from 'next-auth/webauthn';" : ''}
${hasPasskeyProvider && hasNodemailerProvider ? `import { getProviders } from "next-auth/react";` : `import { providerMap } from '../../../auth';`}
${hasPasskeyProvider ? `import type { AuthProvider } from '@toolpad/core';` : ''}
${hasPasskeyProvider ? `import serverSignIn from './actions';` : `import signIn from './actions';`}

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
${
  hasPasskeyProvider && hasNodemailerProvider
    ? `const [providerMap, setProviderMap] = React.useState<AuthProvider[]>();
  React.useEffect(() => {
    const loadProviders = async () => {
      const providers = await getProviders();
      const providerList =
        Object.entries(providers || {}).map(([id, data]) => ({
          id,
          name: data.name,
        })) || [];
      setProviderMap(providerList);
    };
    loadProviders();
  }, []);`
    : ''
}
  return (
    <SignInPage
      providers={providerMap}
      signIn={signIn}
    />
  );
}`;
};

export default signInPage;
