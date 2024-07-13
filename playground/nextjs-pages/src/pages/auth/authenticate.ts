import type { AuthProvider } from '@toolpad/core';
import { AuthError } from 'next-auth';
import { signIn } from 'next-auth/react';

export const credentialsSignIn = async (
  provider: AuthProvider,
  formData: FormData,
  callbackUrl?: string,
) => {
  const signInResponse = await signIn(provider.id, {
    ...Object.fromEntries(formData),
    redirect: false,
  });
  if (signInResponse && signInResponse.error) {
    // Return the error message if the sign in failed
    switch (signInResponse.error) {
      case 'CredentialsSignin':
      case 'Configuration':
        return 'Invalid credentials.';

      default:
        return 'Something went wrong.';
    }
  }
  // Redirect to the callback URL if the sign in was successful
  window.location.href = callbackUrl ?? '/';
  return '';
};

export const providerSignIn = async (
  provider: AuthProvider,
  formData?: FormData,
  callbackUrl?: string,
) => {
  try {
    const signInResponse = await signIn(provider.id, {
      ...(formData && Object.fromEntries(formData)),
      redirectTo: callbackUrl ?? '/',
    });
    return signInResponse?.ok ? '' : 'Something went wrong.';
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
};
