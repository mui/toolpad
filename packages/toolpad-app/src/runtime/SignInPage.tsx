import * as React from 'react';
import { Alert, Snackbar, Stack, Typography, useTheme } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { LoadingButton } from '@mui/lab';
import { useSearchParams } from 'react-router-dom';
import { AuthProvider, AuthContext } from './useAuth';
import productIconDark from '../../public/product-icon-dark.svg';
import productIconLight from '../../public/product-icon-light.svg';

const AUTH_ERROR_URL_PARAM = 'error';

export default function SignInPage() {
  const theme = useTheme();
  const [urlParams] = useSearchParams();

  const { signIn, isSigningIn } = React.useContext(AuthContext);

  const [errorSnackbarMessage, setErrorSnackbarMessage] = React.useState<string>('');
  const [latestSelectedProvider, setLatestSelectedProvider] = React.useState<AuthProvider | null>(
    null,
  );

  const { authProviders } = React.useContext(AuthContext);

  const handleSignIn = React.useCallback(
    (provider: AuthProvider) => () => {
      setLatestSelectedProvider(provider);
      signIn(provider);
    },
    [signIn],
  );

  React.useEffect(() => {
    const authError = urlParams.get(AUTH_ERROR_URL_PARAM);

    if (authError === 'AuthorizedCallbackError') {
      setErrorSnackbarMessage('Access unauthorized.');
    } else if (authError === 'CallbackRouteError') {
      setErrorSnackbarMessage(
        'There was an error with your authentication provider configuration.',
      );
    } else if (authError) {
      setErrorSnackbarMessage('An authentication error occurred.');
    }
  }, [urlParams]);

  const handleErrorSnackbarClose = React.useCallback(() => {
    setErrorSnackbarMessage('');
  }, []);

  const productIcon = theme.palette.mode === 'dark' ? productIconDark : productIconLight;

  return (
    <React.Fragment>
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        flex={1}
        gap={2}
        sx={{ backgroundColor: theme.palette.background.default }}
      >
        <img src={productIcon} alt="Toolpad logo" width={56} height={56} />
        <Typography variant="h1">Sign In</Typography>
        <Typography variant="subtitle1" mb={1}>
          You must be authenticated to use this app.
        </Typography>
        <Stack sx={{ width: 300 }} gap={2}>
          {authProviders.includes('github') ? (
            <LoadingButton
              variant="contained"
              onClick={handleSignIn('github')}
              startIcon={<GitHubIcon />}
              loading={isSigningIn && latestSelectedProvider === 'github'}
              disabled={isSigningIn}
              loadingPosition="start"
              size="large"
              fullWidth
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
              fullWidth
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
          {authProviders.includes('azure-ad') ? (
            <LoadingButton
              variant="contained"
              onClick={handleSignIn('azure-ad')}
              startIcon={
                <img
                  alt="Microsoft Azure logo"
                  loading="lazy"
                  height="18"
                  width="18"
                  src="https://authjs.dev/img/providers/azure.svg"
                />
              }
              loading={isSigningIn && latestSelectedProvider === 'azure-ad'}
              disabled={isSigningIn}
              loadingPosition="start"
              size="large"
              fullWidth
              sx={{
                backgroundColor: '##0072c6',
              }}
            >
              Sign in with Azure AD
            </LoadingButton>
          ) : null}
        </Stack>
      </Stack>
      <Snackbar
        open={!!errorSnackbarMessage}
        autoHideDuration={6000}
        onClose={handleErrorSnackbarClose}
      >
        {errorSnackbarMessage ? (
          <Alert onClose={handleErrorSnackbarClose} severity="error">
            {errorSnackbarMessage}
          </Alert>
        ) : undefined}
      </Snackbar>
    </React.Fragment>
  );
}
