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
        throw new Error('Invalid credentials.');
      default:
        throw new Error('Something went wrong.');
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
    if (signInResponse && !signInResponse?.ok) {
      throw new Error('Something went wrong.');
    }
    return '';
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
};
