'use client';
import * as React from 'react';
import Link from '@mui/material/Link';
import { SignInPage } from '@toolpad/core/SignInPage';
import { providerMap } from '../../../auth';
import signIn from './actions';

function ForgotPasswordLink() {
  return <Link href="/auth/forgot-password">Forgot password?</Link>;
}

function SignUpLink() {
  return <Link href="/auth/signup">Sign up</Link>;
}

export default function SignIn() {
  return (
    <SignInPage
      providers={providerMap}
      signIn={signIn}
      slots={{
        forgotPasswordLink: ForgotPasswordLink,
        signUpLink: SignUpLink,
      }}
    />
  );
}
