import * as React from 'react';
import { AppProvider, SignInPage } from '@toolpad/core';
import { providerMap } from './auth';
import { authenticate } from './actions';

export default function AuthJsSignInApp() {
  return (
    <AppProvider>
      <SignInPage
        signIn={authenticate}
        providers={providerMap}
        componentProps={{
          emailField: {
            autoFocus: false,
          },
        }}
      />
    </AppProvider>
  );
}
