/* eslint-disable import/no-unresolved */
'use server';
import { AuthError } from 'next-auth';
import type { AuthProvider } from '@toolpad/core';
import { signIn } from './auth';

export async function authenticate(
  provider: AuthProvider,
  formData: FormData,
  callbackUrl?: string,
) {
  try {
    return await signIn(provider.id, {
      ...(formData && Object.fromEntries(formData)),
      redirectTo: callbackUrl ?? '/',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong';
      }
    }
    throw error;
  }
}
