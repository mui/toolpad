import * as React from 'react';
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { AuthError } from 'next-auth';
import { signIn } from 'next-auth/react';
import { SignInPage } from '@toolpad/core/SignInPage';
import { auth, providerMap } from '../../auth';

export default function SignIn({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SignInPage
      providers={providers}
      signIn={(provider, formData, callbackUrl) => {
        // Strip the `error` query parameter from the URL
        // This is useful when the user is redirected back to the page
        // after a failed login attempt.
        callbackUrl = callbackUrl?.replace(/\?error=.+$/, '');
        try {
          return signIn(provider.id, {
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
      }}
    />
  );
}

SignIn.getLayout = (page: React.ReactNode) => page;

SignIn.requireAuth = false;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await auth(context);

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: '/' } };
  }

  return {
    props: {
      providers: providerMap,
    },
  };
}
