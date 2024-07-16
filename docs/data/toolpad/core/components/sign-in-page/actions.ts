'use server';
// eslint-disable-next-line import/no-unresolved
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
          throw new Error('Invalid credentials.');
        default:
          throw new Error('Something went wrong.');
      }
    }
    throw error;
  }
}
