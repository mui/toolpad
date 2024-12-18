import { Template } from '../../../../types';

const actionsTemplate: Template = (options) => {
  const { hasCredentialsProvider, hasNodemailerProvider } = options;

  return `'use server';
import { AuthError } from 'next-auth';
import type { AuthProvider } from '@toolpad/core';
import { signIn } from '../../../auth';

export default async function serverSignIn(provider: AuthProvider, formData: FormData, callbackUrl?: string) {
  try {
    return await signIn(provider.id, {      
    ...(formData && { email: formData.get('email'), password: formData.get('password') }),      
      redirectTo: callbackUrl ?? '/',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
     ${
       hasNodemailerProvider
         ? `if (provider.id === 'nodemailer' && (error as any).digest?.includes('verify-request')) {
        return {
          success: 'Check your email for a verification link.',
        };
      }`
         : ''
     }           
      throw error;
    }
    if (error instanceof AuthError) {
      return {
        error: ${
          hasCredentialsProvider
            ? `error.type === 'CredentialsSignin' ? 'Invalid credentials.' : 'An error with Auth.js occurred.'`
            : `'An error with Auth.js occurred.'`
        },
        type: error.type,
      };
    }
    return {
      error: 'Something went wrong.',
      type: 'UnknownError',
    };
  }
}`;
};

export default actionsTemplate;
