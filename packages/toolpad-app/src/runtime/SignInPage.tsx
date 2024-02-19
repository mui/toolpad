import * as React from 'react';
import {
  Alert,
  Button,
  Divider,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import PasswordIcon from '@mui/icons-material/Password';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { LoadingButton } from '@mui/lab';
import { useSearchParams } from 'react-router-dom';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { AuthProvider, AuthContext } from './useAuth';
import productIconDark from '../../public/product-icon-dark.svg';
import productIconLight from '../../public/product-icon-light.svg';

const AUTH_ERROR_URL_PARAM = 'error';

type CredentialsFormInputs = {
  username: string;
  password: string;
};

const azureIconSvg = (
  <svg viewBox="0 0 59.242 47.271" width={18} height={18} xmlns="http://www.w3.org/2000/svg">
    <path
      d="m32.368 0-17.468 15.145-14.9 26.75h13.437zm2.323 3.543-7.454 21.008 14.291 17.956-27.728 4.764h45.442z"
      fill="currentColor"
    />
  </svg>
);

export default function SignInPage() {
  const theme = useTheme();
  const [urlParams] = useSearchParams();

  const { signIn, isSigningIn } = React.useContext(AuthContext);

  const [errorSnackbarMessage, setErrorSnackbarMessage] = React.useState<React.ReactNode>('');
  const [latestSelectedProvider, setLatestSelectedProvider] = React.useState<AuthProvider | null>(
    null,
  );

  const [isCredentialsSignIn, setIsCredentialsSignIn] = React.useState(false);

  const { authProviders } = React.useContext(AuthContext);

  const handleSignIn = React.useCallback(
    (provider: AuthProvider, payload?: Record<string, unknown>, isLocalProvider?: boolean) =>
      () => {
        setLatestSelectedProvider(provider);
        signIn(provider, payload, isLocalProvider);
      },
    [signIn],
  );

  const handleCredentialsSignIn = React.useCallback(() => {
    setIsCredentialsSignIn(true);
  }, []);

  const handleCredentialsBack = React.useCallback(() => {
    setIsCredentialsSignIn(false);
  }, []);

  React.useEffect(() => {
    const authError = urlParams.get(AUTH_ERROR_URL_PARAM);

    if (authError === 'AuthorizedCallbackError') {
      setErrorSnackbarMessage('Access unauthorized.');
    } else if (authError === 'CallbackRouteError') {
      setErrorSnackbarMessage(
        'There was an error with your authentication provider configuration.',
      );
    } else if (authError === 'MissingSecretError') {
      setErrorSnackbarMessage('Missing secret for authentication. Please provide a secret.');
    } else if (authError) {
      setErrorSnackbarMessage('An authentication error occurred.');
    }
  }, [urlParams]);

  const handleErrorSnackbarClose = React.useCallback(() => {
    setErrorSnackbarMessage('');
  }, []);

  const { handleSubmit: handleCredentialsSubmit, control: credentialsFormControl } =
    useForm<CredentialsFormInputs>({
      defaultValues: {
        username: '',
        password: '',
      },
    });

  const onCredentialsSubmit: SubmitHandler<CredentialsFormInputs> = React.useCallback(
    (data) => {
      handleSignIn('credentials', data, true)();
    },
    [handleSignIn],
  );

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
          {isCredentialsSignIn ? (
            <React.Fragment>
              <Stack direction="row" alignItems="center">
                <Button onClick={handleCredentialsBack}>
                  <ArrowBackIcon />
                  <Typography variant="button" sx={{ ml: 1 }}>
                    Back
                  </Typography>
                </Button>
              </Stack>
              <form onSubmit={handleCredentialsSubmit(onCredentialsSubmit)}>
                <Stack direction="column" gap={2}>
                  <Controller
                    name="username"
                    rules={{ required: 'Username is required' }}
                    control={credentialsFormControl}
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                      <TextField
                        helperText={error ? error.message : null}
                        error={!!error}
                        onChange={onChange}
                        value={value}
                        fullWidth
                        label="Username"
                        variant="outlined"
                      />
                    )}
                  />
                  <Controller
                    name="password"
                    rules={{ required: 'Password is required' }}
                    control={credentialsFormControl}
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                      <TextField
                        type="password"
                        helperText={error ? error.message : null}
                        error={!!error}
                        onChange={onChange}
                        value={value}
                        fullWidth
                        label="Password"
                        variant="outlined"
                      />
                    )}
                  />
                  <LoadingButton
                    variant="contained"
                    type="submit"
                    loading={isSigningIn && latestSelectedProvider === 'credentials'}
                    disabled={isSigningIn}
                    size="large"
                    fullWidth
                  >
                    Sign in
                  </LoadingButton>
                </Stack>
              </form>
            </React.Fragment>
          ) : (
            <React.Fragment>
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
                  startIcon={azureIconSvg}
                  loading={isSigningIn && latestSelectedProvider === 'azure-ad'}
                  disabled={isSigningIn}
                  loadingPosition="start"
                  size="large"
                  fullWidth
                  sx={{
                    backgroundColor: '#0072c6',
                  }}
                >
                  Sign in with Azure AD
                </LoadingButton>
              ) : null}
              {authProviders.includes('credentials') ? (
                <React.Fragment>
                  {authProviders.length > 1 ? (
                    <Divider>
                      <Typography variant="caption">OR</Typography>
                    </Divider>
                  ) : null}
                  <LoadingButton
                    variant="contained"
                    onClick={handleCredentialsSignIn}
                    startIcon={<PasswordIcon />}
                    loading={isSigningIn && latestSelectedProvider === 'credentials'}
                    disabled={isSigningIn}
                    loadingPosition="start"
                    size="large"
                    fullWidth
                  >
                    Sign in with credentials
                  </LoadingButton>
                </React.Fragment>
              ) : null}
            </React.Fragment>
          )}
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
