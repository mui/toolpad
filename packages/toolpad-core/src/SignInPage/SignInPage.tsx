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
import TextField, { TextFieldProps } from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton, { LoadingButtonProps } from '@mui/lab/LoadingButton';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import PasswordIcon from '@mui/icons-material/Password';
import AppleIcon from '@mui/icons-material/Apple';
import Stack from '@mui/material/Stack';

import GoogleIcon from './icons/Google';
import FacebookIcon from './icons/Facebook';
import TwitterIcon from './icons/Twitter';
import InstagramIcon from './icons/Instagram';
import TikTokIcon from './icons/TikTok';
import LinkedInIcon from './icons/LinkedIn';
import SlackIcon from './icons/Slack';
import SpotifyIcon from './icons/Spotify';
import TwitchIcon from './icons/Twitch';
import DiscordIcon from './icons/Discord';
import LineIcon from './icons/Line';
import Auth0Icon from './icons/Auth0';
import MicrosoftEntraIdIcon from './icons/MicrosoftEntra';
import CognitoIcon from './icons/Cognito';
import GitLabIcon from './icons/GitLab';
import KeycloakIcon from './icons/Keycloak';
import OktaIcon from './icons/Okta';
import FusionAuthIcon from './icons/FusionAuth';

import { BrandingContext, DocsContext, RouterContext } from '../shared/context';

const IconProviderMap = new Map<string, React.ReactNode>([
  ['github', <GitHubIcon key="github" />],
  ['credentials', <PasswordIcon key="credentials" />],
  ['google', <GoogleIcon key="google" />],
  ['facebook', <FacebookIcon key="facebook" />],
  ['twitter', <TwitterIcon key="twitter" />],
  ['apple', <AppleIcon key="apple" />],
  ['instagram', <InstagramIcon key="instagram" />],
  ['tiktok', <TikTokIcon key="tiktok" />],
  ['linkedin', <LinkedInIcon key="linkedin" />],
  ['slack', <SlackIcon key="slack" />],
  ['spotify', <SpotifyIcon key="spotify" />],
  ['twitch', <TwitchIcon key="twitch" />],
  ['discord', <DiscordIcon key="discord" />],
  ['line', <LineIcon key="line" />],
  ['auth0', <Auth0Icon key="auth0" />],
  ['microsoft-entra-id', <MicrosoftEntraIdIcon key="microsoft-entra-id" />],
  ['cognito', <CognitoIcon key="cognito" />],
  ['gitlab', <GitLabIcon key="gitlab" />],
  ['keycloak', <KeycloakIcon key="keycloak" />],
  ['okta', <OktaIcon key="okta" />],
  ['fusionauth', <FusionAuthIcon key="fusionauth" />],
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
  const router = React.useContext(RouterContext);
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

  const callbackUrl = router?.searchParams.get('callbackUrl') ?? '/';

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
