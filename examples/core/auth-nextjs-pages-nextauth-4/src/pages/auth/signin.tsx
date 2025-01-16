import * as React from 'react';
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import Link from '@mui/material/Link';
import { SignInPage, type AuthProvider } from '@toolpad/core/SignInPage';
import { getProviders, signIn } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { useRouter } from 'next/router';
import { authOptions } from '../api/auth/[...nextauth]';

function ForgotPasswordLink() {
  return (
    <Link href="/auth/forgot-password" fontSize={14}>
      Forgot password?
    </Link>
  );
}

function SignUpLink() {
  return <Link href="/auth/signup">Sign up</Link>;
}

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
      slots={{ forgotPasswordLink: ForgotPasswordLink, signUpLink: SignUpLink }}
    />
  );
}

SignIn.getLayout = (page: React.ReactNode) => page;

SignIn.requireAuth = false;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: '/' } };
  }

  const providers = await getProviders();
  let providerMap: AuthProvider[] = [];
  if (providers) {
    providerMap = Object.entries(providers).map(([id, provider]) => {
      return { id, name: provider.name };
    });
  }

  return {
    props: {
      providers: providerMap,
    },
  };
}
