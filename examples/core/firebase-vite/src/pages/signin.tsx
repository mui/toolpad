'use client';
import * as React from 'react';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import { SignInPage } from '@toolpad/core/SignInPage';
import { Navigate, useNavigate } from 'react-router';
import { useSession, type Session } from '../SessionContext';
import { signInWithGoogle, signInWithGithub, signInWithCredentials } from '../firebase/auth';

function DemoInfo() {
  return (
    <Alert severity="info">
      You can use <strong>toolpad-demo@mui.com</strong> with the password <strong>@demo1</strong> to
      test
    </Alert>
  );
}

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
      providers={[
        { id: 'google', name: 'Google' },
        { id: 'github', name: 'GitHub' },
        { id: 'credentials', name: 'Credentials' },
      ]}
      signIn={async (provider, formData, callbackUrl) => {
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

            result = await signInWithCredentials(email, password);
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
      slots={{ subtitle: DemoInfo }}
      slotProps={{
        emailField: {
          defaultValue: 'toolpad-demo@mui.com',
        },
        passwordField: {
          defaultValue: '@demo1',
        },
      }}
    />
  );
}
