'use client';

import * as React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton, { LoadingButtonProps } from '@mui/lab/LoadingButton';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import PasswordIcon from '@mui/icons-material/Password';
import FacebookIcon from '@mui/icons-material/Facebook';
import Stack from '@mui/material/Stack';
import { BrandingContext, DocsContext } from '../shared/context';

const IconProviderMap = new Map<string, React.ReactNode>([
  ['github', <GitHubIcon key="github" />],
  ['credentials', <PasswordIcon key="credentials" />],
  [
    'google',
    // colored google icon
    <svg key="google" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
      <path d="M1 1h22v22H1z" fill="none" />
    </svg>,
  ],
  ['facebook', <FacebookIcon key="facebook" />],
]);

export interface AuthProvider {
  /**
   * The unique identifier of the authentication provider.
   * @default ''
   * @example 'google'
   * @example 'github'
   */
  id: string;
  /**
   * The name of the authentication provider.
   * @default ''
   * @example 'Google'
   * @example 'GitHub'
   */
  name: string;
}

export interface AuthResponse {
  /**
   * The error message if the sign-in failed.
   * @default ''
   */
  error?: string;
  /**
   * The type of error that occurred.
   * @default ''
   */
  type?: string;
}

export interface SignInPageProps {
  /**
   * The list of authentication providers to display.
   * @default []
   */
  providers?: AuthProvider[];
  /**
   * Callback fired when a user signs in.
   * @param {AuthProvider} provider The authentication provider.
   * @param {FormData} formData The form data if the provider id is 'credentials'.\
   * @param {string} callbackUrl The URL to redirect to after signing in.
   * @returns {void|Promise<AuthResponse>}
   * @default undefined
   */
  signIn?: (
    provider: AuthProvider,
    formData?: any,
    callbackUrl?: string,
  ) => void | Promise<AuthResponse>;
  /**
   * Props to pass to the constituent components in the credentials form
   * @default {}
   * @example { email: { autoFocus: false } }
   * @example { password: { variant: 'outlined' } }
   * @example { email: { autoFocus: false }, password: { variant: 'outlined' } }
   */
  slotProps?: {
    emailField?: TextFieldProps;
    passwordField?: TextFieldProps;
    submitButton?: LoadingButtonProps;
  };
}

/**
 *
 * Demos:
 *
 * - [Sign In Page](https://mui.com/toolpad/core/react-sign-in-page/)
 *
 * API:
 *
 * - [SignInPage API](https://mui.com/toolpad/core/api/sign-in-page)
 */
function SignInPage(props: SignInPageProps) {
  const { providers, signIn, slotProps } = props;
  const branding = React.useContext(BrandingContext);
  const docs = React.useContext(DocsContext);
  const credentialsProvider = providers?.find((provider) => provider.id === 'credentials');
  const [{ loading, providerId, error }, setFormStatus] = React.useState<{
    loading: boolean;
    providerId: string;
    error?: string;
  }>({
    providerId: '',
    loading: false,
    error: '',
  });

  const callbackUrl =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('callbackUrl') ?? '/'
      : '/';

  const singleProvider = React.useMemo(() => providers?.length === 1, [providers]);

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {branding?.logo ?? (
          <Avatar sx={{ my: 1, mb: 2, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
        )}

        <Typography variant="h5" color="textPrimary" gutterBottom>
          Sign in {branding?.title ? `to ${branding.title}` : null}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Welcome user, please sign in to continue
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Stack spacing={1}>
            {error && providerId !== 'credentials' ? <Alert severity="error">{error}</Alert> : null}
            {Object.values(providers ?? {}).map((provider) => {
              if (provider.id === 'credentials') {
                return null;
              }
              return (
                <form
                  key={provider.id}
                  onSubmit={async (event) => {
                    event.preventDefault();
                    setFormStatus({ error: '', providerId: provider.id, loading: true });
                    const oauthResponse = await signIn?.(provider, undefined, callbackUrl);
                    setFormStatus((prev) => ({
                      ...prev,
                      loading: false,
                      error: oauthResponse?.error,
                    }));
                  }}
                >
                  <LoadingButton
                    key={provider.id}
                    variant="contained"
                    type="submit"
                    fullWidth
                    size="large"
                    disableElevation
                    name={'provider'}
                    color={singleProvider ? 'primary' : 'inherit'}
                    loading={loading && providerId === provider.id}
                    value={provider.id}
                    startIcon={IconProviderMap.get(provider.id)}
                    sx={{
                      textTransform: 'capitalize',
                      filter: 'opacity(0.9)',
                      transition: 'filter 0.2s ease-in',
                      '&:hover': {
                        filter: 'opacity(1)',
                      },
                    }}
                  >
                    <span>Sign in with {provider.name}</span>
                  </LoadingButton>
                </form>
              );
            })}
          </Stack>

          {credentialsProvider ? (
            <React.Fragment>
              {singleProvider ? null : <Divider sx={{ mt: 2, mx: 0, mb: 1 }}>or</Divider>}
              {error && providerId === 'credentials' ? (
                <Alert sx={{ my: 2 }} severity="error">
                  {error}
                </Alert>
              ) : null}
              <Box
                component="form"
                onSubmit={async (event) => {
                  setFormStatus({
                    error: '',
                    providerId: credentialsProvider.id,
                    loading: true,
                  });
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  const credentialsResponse = await signIn?.(
                    credentialsProvider,
                    formData,
                    callbackUrl,
                  );
                  setFormStatus((prev) => ({
                    ...prev,
                    loading: false,
                    error: credentialsResponse?.error,
                  }));
                }}
              >
                <TextField
                  margin="dense"
                  required
                  inputProps={{
                    sx: { paddingTop: '12px', paddingBottom: '12px' },
                  }}
                  InputLabelProps={{
                    sx: { lineHeight: '1rem' },
                  }}
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoFocus={docs ? false : singleProvider}
                  {...slotProps?.emailField}
                />
                <TextField
                  margin="dense"
                  required
                  fullWidth
                  inputProps={{
                    sx: { paddingTop: '12px', paddingBottom: '12px' },
                  }}
                  InputLabelProps={{
                    sx: { lineHeight: '1rem' },
                  }}
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  {...slotProps?.passwordField}
                />
                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label="Remember me"
                  slotProps={{ typography: { color: 'textSecondary' } }}
                />
                <LoadingButton
                  type="submit"
                  fullWidth
                  size="large"
                  variant="contained"
                  disableElevation
                  color={singleProvider ? 'primary' : 'inherit'}
                  loading={loading && providerId === credentialsProvider.id}
                  sx={{
                    mt: 3,
                    mb: 2,
                    textTransform: 'capitalize',
                    filter: 'opacity(0.9)',
                    transition: 'filter 0.2s ease-in',
                    '&:hover': {
                      filter: 'opacity(1)',
                    },
                  }}
                  {...slotProps?.submitButton}
                >
                  Sign in
                </LoadingButton>
                <Grid container>
                  <Grid item xs>
                    <Link href="/" variant="body2">
                      Forgot password?
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link href="/" variant="body2">
                      {"Don't have an account? Sign Up"}
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            </React.Fragment>
          ) : null}
        </Box>
      </Box>
    </Container>
  );
}

SignInPage.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The list of authentication providers to display.
   * @default []
   */
  providers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ),
  /**
   * Callback fired when a user signs in.
   * @param {AuthProvider} provider The authentication provider.
   * @param {FormData} formData The form data if the provider id is 'credentials'.\
   * @param {string} callbackUrl The URL to redirect to after signing in.
   * @returns {void|Promise<AuthResponse>}
   * @default undefined
   */
  signIn: PropTypes.func,
  /**
   * Props to pass to the constituent components in the credentials form
   * @default {}
   * @example { email: { autoFocus: false } }
   * @example { password: { variant: 'outlined' } }
   * @example { email: { autoFocus: false }, password: { variant: 'outlined' } }
   */
  slotProps: PropTypes.shape({
    emailField: PropTypes.object,
    passwordField: PropTypes.object,
    submitButton: PropTypes.object,
  }),
} as any;

export { SignInPage };
