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
      signIn={async (provider, formData, callbackUrl) => {
        if (provider.id === 'credentials') {
          const signInResponse = await signIn(provider.id, {
            ...Object.fromEntries(formData),
            redirect: false,
          });
          if (signInResponse && signInResponse.error) {
            // Return the error message if the sign-in failed
            if (
              signInResponse.error === 'CredentialsSignin' ||
              signInResponse.error === 'Configuration'
            ) {
              return 'Invalid credentials.';
            }
            return 'Something went wrong.';
          } else {
            // Redirect to the callback URL if the sign-in was successful
            window.location.href = callbackUrl ?? '/';
            return '';
          }
        } else {
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
