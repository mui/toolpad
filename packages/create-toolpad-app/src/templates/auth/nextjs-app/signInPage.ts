import { Template } from '../../../types';

const signInPage: Template = (options) => {
  const { authProviders: providers } = options;
  const hasCredentialsProvider = providers?.includes('credentials');
  const hasNodemailerProvider = providers?.includes('nodemailer');

  return `import * as React from 'react';
import { SignInPage, type AuthProvider } from '@toolpad/core/SignInPage';
import { AuthError } from 'next-auth';
import { providerMap, signIn } from '../../../auth';

export default function SignIn() {
  return (
    <SignInPage
      providers={providerMap}
      signIn={async (provider: AuthProvider, formData: FormData, callbackUrl?: string) => {
        'use server';
        try {
          return await signIn(provider.id, {            
            redirectTo: callbackUrl ?? '/',
          });
        } catch (error) {
          // The desired flow for successful sign in in all cases
          // and unsuccessful sign in for OAuth providers will cause a \`redirect\`,
          // and \`redirect\` is a throwing function, so we need to re-throw
          // to allow the redirect to happen
          // Source: https://github.com/vercel/next.js/issues/49298#issuecomment-1542055642
          // Detect a \`NEXT_REDIRECT\` error and re-throw it
          if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
           ${
             hasNodemailerProvider
               ? `// For the nodemailer provider, we want to return a success message
            // instead of redirecting to a \`verify-request\` page
            if (provider.id === 'nodemailer' && (error as any).digest?.includes('verify-request')) {
              return {
                success: 'Check your email for a verification link.',
                };
              }`
               : ''
           }           
            throw error;
          }
          // Handle Auth.js errors
          if (error instanceof AuthError) {
            return {
              error: ${
                hasCredentialsProvider
                  ? `error.type === 'CredentialsSignin' ? 'Invalid credentials.'
              : 'An error with Auth.js occurred.',`
                  : `'An error with Auth.js occurred.'`
              },
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
}`;
};

export default signInPage;
