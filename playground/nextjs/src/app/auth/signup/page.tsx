'use client';
import * as React from 'react';
import { SignUpPage } from '@toolpad/core/AuthPage';
import { providerMap } from '../../../auth';
import signUp from './actions';

export default function SignIn() {
  return (
    <SignUpPage
      providers={providerMap}
      slots={{ termsLink: '/terms', privacyLink: '/privacy' }}
      signUp={signUp}
    />
  );
}
