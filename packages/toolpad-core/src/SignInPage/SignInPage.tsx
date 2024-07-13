'use client';

import * as React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
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
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import Stack from '@mui/material/Stack';
import { BrandingContext } from '../AppProvider';
import { useNotifications } from '../useNotifications';

const IconProviderMap = new Map<string, React.ReactNode>([
  ['github', <GitHubIcon key="github" />],
  ['credentials', <PasswordIcon key="credentials" />],
  ['google', <GoogleIcon key="google" />],
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
   * @returns {void} | {string}
   * @default undefined
   */
  signIn?: (provider: AuthProvider, formData?: any, callbackUrl?: string) => void | Promise<string>;
  /**
   * Props to pass to the constituent components in the credentials form
   * @default {}
   * @example { email: { autoFocus: false } }
   * @example { password: { variant: 'outlined' } }
   * @example { email: { autoFocus: false }, password: { variant: 'outlined' } }
   */
  componentProps?: {
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
  const { providers, signIn, componentProps } = props;
  const branding = React.useContext(BrandingContext);
  const credentialsProvider = providers?.find((provider) => provider.id === 'credentials');
  const [{ loading, providerId }, setFormStatus] = React.useState<{
    loading: boolean;
    providerId: string;
  }>({
    providerId: '',
    loading: false,
  });

  const callbackUrl =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('callbackUrl') ?? '/'
      : '/';

  const notifications = useNotifications();

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
            {Object.values(providers ?? {}).map((provider) => {
              if (provider.id === 'credentials') {
                return null;
              }
              return (
                <form
                  key={provider.id}
                  onSubmit={(event) => {
                    event.preventDefault();
                    setFormStatus((prev) => ({ ...prev, providerId: provider.id, loading: true }));
                    // OAuth providers will redirect to their own page
                    // so we don't need to set loading to false, or wait for a response
                    signIn?.(provider);
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
              {(providers ?? []).length === 1 ? null : (
                <Divider sx={{ mt: 2, mx: 0, mb: 1 }}>or</Divider>
              )}

              <Box
                component="form"
                onSubmit={async (event) => {
                  setFormStatus({
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
                  }));
                  if (credentialsResponse) {
                    notifications.show(credentialsResponse, {
                      severity: 'error',
                      autoHideDuration: 30000,
                    });
                  }
                }}
                noValidate
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
                  autoFocus
                  {...componentProps?.emailField}
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
                  {...componentProps?.passwordField}
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
                  color="primary"
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
                  {...componentProps?.submitButton}
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
   * Props to pass to the constituent components in the credentials form
   * @default {}
   * @example { email: { autoFocus: false } }
   * @example { password: { variant: 'outlined' } }
   * @example { email: { autoFocus: false }, password: { variant: 'outlined' } }
   */
  componentProps: PropTypes.object,
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
   * @returns {void} | {string}
   * @default undefined
   */
  signIn: PropTypes.func,
} as any;

export { SignInPage };
