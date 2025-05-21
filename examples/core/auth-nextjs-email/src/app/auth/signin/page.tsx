import * as React from 'react';
import { SignInPage } from '@toolpad/core/AuthPage';
import { providerMap } from '../../../auth';
import signIn from './actions';

export default function SignIn() {
  return (
    <React.Fragment>
      <SignInPage providers={providerMap} signIn={signIn} />;
    </React.Fragment>
  );
}
