import * as React from 'react';
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { SignInPage } from '@toolpad/core/SignInPage';
import { auth, providerMap } from '../../auth';
import { providerSignIn, credentialsSignIn } from './authenticate';

export default function SignIn({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SignInPage
      providers={providers}
      signIn={(provider, formData, callbackUrl) => {
        if (provider.id === 'credentials') {
          return credentialsSignIn(provider, formData, callbackUrl);
        }
        return providerSignIn(provider, formData, callbackUrl);
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
