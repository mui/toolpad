import * as React from 'react';
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { SignInPage } from '@toolpad/core/SignInPage';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { auth, providerMap } from '../../auth';

export default function SignIn({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  return (
    <SignInPage
      providers={providers}
      signIn={async (provider, formData, callbackUrl) => {
        try {
          const signInResponse = await signIn(
            provider.id,
            formData
              ? {
                  email: formData.get('email') as string,
                  password: formData.get('password') as string,
                  redirect: false,
                }
              : { callbackUrl: callbackUrl ?? '/' },
          );
          if (signInResponse && signInResponse.error) {
            // Handle Auth.js errors
            return {
              error:
                signInResponse.error === 'CredentialsSignin'
                  ? 'Invalid credentials'
                  : 'An error with Auth.js occurred',
              type: signInResponse.error,
            };
          }
          // If the sign in was successful,
          // manually redirect to the callback URL
          // since the `redirect: false` option was used
          // to be able to display error messages on the same page without a full page reload
          if (provider.id === 'credentials') {
            router.push(callbackUrl ?? '/');
          }
          return {};
        } catch (error) {
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
