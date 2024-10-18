/* eslint-disable import/no-unresolved */

import * as React from 'react';
import { AuthError } from 'next-auth';
import { SignInPage } from '@toolpad/core/SignInPage';
import { providerMap, signIn } from './auth';

export default function AuthJsSignInApp() {
  return (
    <SignInPage
      providers={providerMap}
      signIn={async (provider, formData, callbackUrl) => {
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
