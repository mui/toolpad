import { Template } from '../../../types';

const signinTemplate: Template = (options) => {
  const { hasCredentialsProvider = true } = options;

  const hasGoogleProvider = options.authProviders?.includes('google');
  const hasGithubProvider = options.authProviders?.includes('github');

  const providers = [
    ...(hasGoogleProvider ? [`{ id: 'google', name: 'Google' }`] : []),
    ...(hasGithubProvider ? [`{ id: 'github', name: 'GitHub' }`] : []),
    ...(hasCredentialsProvider ? [`{ id: 'credentials', name: 'Credentials' }`] : []),
  ];

  return `'use client';
import * as React from 'react';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import { SignInPage } from '@toolpad/core/SignInPage';
import { Navigate, useNavigate } from 'react-router';
import { useSession, type Session } from '../SessionContext';
import { ${[
    hasGoogleProvider && 'signInWithGoogle',
    hasGithubProvider && 'signInWithGithub',
    hasCredentialsProvider && 'signInWithCredentials',
  ]
    .filter(Boolean)
    .join(', ')} } from '../firebase/auth';


export default function SignIn() {
  const { session, setSession, loading } = useSession();
  const navigate = useNavigate();

  if (loading) {
    return <LinearProgress />;
  }

  if (session) {
    return <Navigate to="/" />;
  }

  return (
    <SignInPage
      providers={[${providers.join(', ')}]}
      signIn={async (provider, formData, callbackUrl) => {
        let result;
        try {
          ${
            hasGoogleProvider
              ? `if (provider.id === 'google') {
            result = await signInWithGoogle();
          }`
              : ''
          }
          ${
            hasGithubProvider
              ? `if (provider.id === 'github') {
            result = await signInWithGithub();
          }`
              : ''
          }
          ${
            hasCredentialsProvider
              ? `if (provider.id === 'credentials') {
            const email = formData?.get('email') as string;
            const password = formData?.get('password') as string;

            if (!email || !password) {
              return { error: 'Email and password are required' };
            }

            result = await signInWithCredentials(email, password);
          }`
              : ''
          }

          if (result?.success && result?.user) {
            const userSession: Session = {
              user: {
                name: result.user.displayName || '',
                email: result.user.email || '',
                image: result.user.photoURL || '',
              },
            };
            setSession(userSession);
            navigate(callbackUrl || '/', { replace: true });
            return {};
          }
          return { error: result?.error || 'Failed to sign in' };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'An error occurred' };
        }
      }}
        
    />
  );
}`;
};

export default signinTemplate;
