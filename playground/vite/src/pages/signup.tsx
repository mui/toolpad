'use client';
import * as React from 'react';

import Link from '@mui/material/Link';
import LinearProgress from '@mui/material/LinearProgress';
import { SignUpPage } from '@toolpad/core/SignUpPage';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useSession, type Session } from '../SessionContext';
import {
  signUpWithCredentials,
  signUpWithEmailLink,
  signInWithGoogle,
  signInWithGithub,
  completeSignUpWithEmailLink,
} from '../firebase/auth';

function SignInLink() {
  return <Link href="/sign-in">Sign In</Link>;
}

export default function SignUp() {
  const { session, setSession, loading } = useSession();
  const [completing, setCompleting] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    async function completeSignUp() {
      if (!loading && !session && location.search) {
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('provider') === 'email' && searchParams.get('partial') === 'true') {
          setCompleting(true);
          await completeSignUpWithEmailLink();
          setCompleting(false);
        }
      }
    }
    completeSignUp();
  }, [loading, session, location]);

  if (loading || completing) {
    return <LinearProgress />;
  }

  if (session) {
    return <Navigate to="/" />;
  }

  return (
    <SignUpPage
      providers={[
        { id: 'google', name: 'Google' },
        { id: 'github', name: 'GitHub' },
        { id: 'email', name: 'Email' },
        { id: 'credentials', name: 'Credentials' },
      ]}
      signUp={async (provider, formData, callbackUrl) => {
        let result;
        try {
          if (provider.id === 'google') {
            result = await signInWithGoogle();
          }
          if (provider.id === 'github') {
            result = await signInWithGithub();
          }
          if (provider.id === 'credentials') {
            const email = formData?.get('email') as string;
            const password = formData?.get('password') as string;

            if (!email || !password) {
              return { error: 'Email and password are required' };
            }

            result = await signUpWithCredentials(email, password);
          }
          if (provider.id === 'email') {
            const email = formData?.get('email') as string;
            if (!email) {
              return { error: 'Email is required' };
            }
            result = await signUpWithEmailLink(email);
            if (result.success) {
              return { success: 'Check your inbox for a verification link.' };
            }
          }

          if (result?.success && result?.user) {
            // Convert Firebase user to Session format
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
      slots={{ signInLink: SignInLink }}
    />
  );
}
