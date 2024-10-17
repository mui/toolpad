import * as React from 'react';
import Paper from '@mui/material/Paper';
import { HighlightedCode } from '@mui/docs/HighlightedCode';
import DemoSandbox from 'docs/src/modules/components/DemoSandbox';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage, type AuthProvider } from '@toolpad/core/SignInPage';
import Frame from '../../modules/components/Frame';

const NOOP = () => {};

const code = `

const providers = [
  { id: 'github', name: 'GitHub' },
  { id: 'google', name: 'Google' },
  { id: 'facebook', name: 'Facebook' },
];

const signIn = async (provider) => {  
    try {  
    await signIn(provider.id);    
    } catch (error) {
     // Handle errors
    }
};

export default function OAuthSignInPage() {
  return (
    <AppProvider>
      <SignInPage signIn={signIn} providers={providers} />
    </AppProvider>    
  );
}

`;

const providers = [
  { id: 'github', name: 'GitHub' },
  { id: 'google', name: 'Google' },
  { id: 'facebook', name: 'Facebook' },
];

const signIn: (provider: AuthProvider) => void = async (provider) => {
  const promise = new Promise<void>((resolve) => {
    setTimeout(() => {
      // eslint-disable-next-line no-console
      console.log(`Sign in with ${provider.id}`);
      resolve();
    }, 500);
  });
  return promise;
};

function OAuthSignInPage() {
  return (
    <AppProvider>
      <SignInPage signIn={signIn} providers={providers} />
    </AppProvider>
  );
}

export default function ToolpadDashboardLayout() {
  return (
    <Frame sx={{ height: '100%' }}>
      <Frame.Demo sx={{ p: 2 }}>
        <Paper
          variant="outlined"
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            maxWidth: '100%',
            mx: 'auto',
            bgcolor: '#FFF',
            borderRadius: '8px',
            overflow: 'hidden',
            ...theme.applyDarkStyles({
              bgcolor: 'primaryDark.900',
            }),
          })}
        >
          <DemoSandbox
            iframe
            name="DashboardLayout"
            onResetDemoClick={NOOP}
            productId="toolpad-core"
            usesCssVarsTheme
          >
            <OAuthSignInPage />
          </DemoSandbox>
        </Paper>
      </Frame.Demo>
      <Frame.Info data-mui-color-scheme="dark" sx={{ maxHeight: 600, overflow: 'auto' }}>
        <HighlightedCode copyButtonHidden plainStyle code={code} language="jsx" />
      </Frame.Info>
    </Frame>
  );
}
