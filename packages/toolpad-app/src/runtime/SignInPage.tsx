import * as React from 'react';
import { CircularProgress, Stack, Typography, useTheme } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useQuery } from '@tanstack/react-query';
import { LoadingButton } from '@mui/lab';
import api from './api';
import { AuthProvider, AuthSessionContext } from './useAuthSession';

export default function SignInPage() {
  const theme = useTheme();

  const { signIn, isSigningIn } = React.useContext(AuthSessionContext);

  const [latestSelectedProvider, setLatestSelectedProvider] = React.useState<AuthProvider | null>(
    null,
  );

  const { data: authProviders = [], isLoading: isLoadingAuthProviders } = useQuery({
    queryKey: ['getAuthProviders'],
    queryFn: async () => {
      return api.methods.getAuthProviders();
    },
  });

  const handleSignIn = React.useCallback(
    (provider: AuthProvider) => () => {
      setLatestSelectedProvider(provider);
      signIn(provider);
    },
    [signIn],
  );

  const productIconSrc = `${window.location.origin}/${
    theme.palette.mode === 'dark' ? 'product-icon-dark.svg' : 'product-icon-light.svg'
  }`;

  return (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
      flex={1}
      gap={2}
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      {isLoadingAuthProviders ? (
        <CircularProgress color="primary" size={56} />
      ) : (
        <React.Fragment>
          <img src={productIconSrc} alt="Toolpad logo" width={56} height={56} />
          <Typography variant="h1">Sign In</Typography>
          <Typography variant="subtitle1" mb={1}>
            You must be authenticated to use this app.
          </Typography>
          {authProviders.includes('github') ? (
            <LoadingButton
              variant="contained"
              onClick={handleSignIn('github')}
              startIcon={<GitHubIcon />}
              loading={isSigningIn && latestSelectedProvider === 'github'}
              disabled={isSigningIn}
              loadingPosition="start"
              size="large"
              sx={{
                backgroundColor: '#24292F',
              }}
            >
              Sign in with GitHub
            </LoadingButton>
          ) : null}
          {authProviders.includes('google') ? (
            <LoadingButton
              variant="contained"
              onClick={handleSignIn('google')}
              startIcon={
                <img
                  alt="Google logo"
                  loading="lazy"
                  height="18"
                  width="18"
                  src="https://authjs.dev/img/providers/google.svg"
                  style={{ marginLeft: '2px', marginRight: '2px' }}
                />
              }
              loading={isSigningIn && latestSelectedProvider === 'google'}
              disabled={isSigningIn}
              loadingPosition="start"
              size="large"
              sx={{
                backgroundColor: '#fff',
                color: '#000',
                '&:hover': {
                  color: theme.palette.primary.contrastText,
                },
              }}
            >
              Sign in with Google
            </LoadingButton>
          ) : null}
        </React.Fragment>
      )}
    </Stack>
  );
}
