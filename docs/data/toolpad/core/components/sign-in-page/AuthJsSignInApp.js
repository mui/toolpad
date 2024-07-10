import * as React from 'react';
import { SignInPage } from '@toolpad/core';
import { providerMap } from './auth';
import { authenticate } from './actions';

export default function AuthJsSignInApp() {
  return <SignInPage signIn={authenticate} providers={providerMap} />;
}
