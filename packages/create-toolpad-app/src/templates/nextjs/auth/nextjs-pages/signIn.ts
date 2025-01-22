import { Template } from '../../../../types';

const signIn: Template = (options) => {
  const { hasCredentialsProvider, hasNodemailerProvider, hasPasskeyProvider } = options;

  return `import * as React from 'react';
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { SignInPage } from '@toolpad/core/SignInPage';
${hasPasskeyProvider ? "import { signIn as webauthnSignIn } from 'next-auth/webauthn';" : ''}
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
         ${
           hasPasskeyProvider
             ? `if (provider.id === 'passkey') {
            try {
              return await webauthnSignIn('passkey', {
                email: formData.get('email'),
                callbackUrl: callbackUrl || '/',                
              });
            } catch (error) {
              console.error(error);
              return {
                error: (error as Error)?.message || 'Something went wrong',
                type: 'WebAuthnError',
              };
            }
          }`
             : ''
         }
          const signInResponse = await signIn(
            provider.id, {
            ...(formData ? { email: formData.get('email'), password: formData.get('password')${hasNodemailerProvider || hasCredentialsProvider ? `, redirect: false` : ''}
              } :
            { callbackUrl: callbackUrl ?? '/' })
          }
          );
          ${
            hasNodemailerProvider
              ? `\n// For the nodemailer provider, we want to return a success message
            // instead of redirecting to a \`verify-request\` page
            if (
              provider.id === "nodemailer"                            
            ) {
              return {
                success: "Check your email for a verification link.",
              };
            }
            `
              : ''
          }
          if (signInResponse && signInResponse.error) {
            // Handle Auth.js errors
            return {
              error: ${
                hasCredentialsProvider
                  ? `signInResponse.error === 'CredentialsSignin' ? 'Invalid credentials.'
              : 'An error with Auth.js occurred.'`
                  : `'An error with Auth.js occurred'`
              },
              type: signInResponse.error,
            };
          }         
          ${
            hasCredentialsProvider || hasNodemailerProvider
              ? `
            if(provider.id === "credentials" || provider.id === "nodemailer") {
              router.push(callbackUrl ?? '/');
            }`
              : ''
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
}`;
};

export default signIn;
