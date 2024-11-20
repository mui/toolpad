'use client';

import * as React from 'react';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton, { LoadingButtonProps } from '@mui/lab/LoadingButton';
import GitHubIcon from '@mui/icons-material/GitHub';
import PasswordIcon from '@mui/icons-material/Password';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import AppleIcon from '@mui/icons-material/Apple';
import { alpha, useTheme, SxProps } from '@mui/material/styles';
import { LinkProps } from '@mui/material/Link';
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
import { BrandingContext, RouterContext } from '../shared/context';
import { DocsContext } from '../internal/context';

type SupportedOAuthProvider =
  | 'github'
  | 'google'
  | 'facebook'
  | 'gitlab'
  | 'twitter'
  | 'apple'
  | 'instagram'
  | 'tiktok'
  | 'linkedin'
  | 'slack'
  | 'spotify'
  | 'twitch'
  | 'discord'
  | 'line'
  | 'auth0'
  | 'cognito'
  | 'keycloak'
  | 'okta'
  | 'fusionauth'
  | 'microsoft-entra-id';

export type SupportedAuthProvider =
  | SupportedOAuthProvider
  | 'credentials'
  | 'passkey'
  | 'nodemailer'
  | string;

const IconProviderMap = new Map<SupportedAuthProvider, React.ReactNode>([
  ['github', <GitHubIcon key="github" />],
  ['credentials', <PasswordIcon key="credentials" />],
  ['google', <GoogleIcon key="google" />],
  ['facebook', <FacebookIcon key="facebook" />],
  ['passkey', <FingerprintIcon key="passkey" />],
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
   * @default undefined
   * @example 'google'
   * @example 'github'
   */
  id: SupportedAuthProvider;
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
   * The type of error if the sign-in failed.
   * @default ''
   */
  type?: string;
  /**
   * The success notification if the sign-in was successful.
   * @default ''
   * Only used for magic link sign-in.
   * @example 'Check your email for a magic link.'
   */
  success?: string;
}

export interface SignInPageSlots {
  /**
   * The custom email field component used in the credentials form.
   * @default TextField
   */
  emailField?: React.JSXElementConstructor<TextFieldProps>;
  /**
   * The custom password field component used in the credentials form.
   * @default TextField
   */
  passwordField?: React.JSXElementConstructor<TextFieldProps>;
  /**
   * The custom submit button component used in the credentials form.
   * @default LoadingButton
   */
  submitButton?: React.JSXElementConstructor<LoadingButtonProps>;
  /**
   * The custom forgot password link component used in the credentials form.
   * @default Link
   */
  forgotPasswordLink?: React.JSXElementConstructor<LinkProps>;
  /**
   * The custom sign up link component used in the credentials form.
   * @default Link
   */
  signUpLink?: React.JSXElementConstructor<LinkProps>;
  /**
   * A component to override the default title section
   * @default Typography
   */
  title?: React.ElementType;
  /**
   * A component to override the default subtitle section
   * @default Typography
   */
  subtitle?: React.ElementType;
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
  ) => void | Promise<AuthResponse> | undefined;
  /**
   * The components used for each slot inside.
   * @default {}
   * @example { forgotPasswordLink: <Link href="/forgot-password">Forgot password?</Link> }
   * @example { signUpLink: <Link href="/sign-up">Sign up</Link> }
   */
  slots?: SignInPageSlots;
  /**
   * The props used for each slot inside.
   * @default {}
   * @example { emailField: { autoFocus: false } }
   * @example { passwordField: { variant: 'outlined' } }
   * @example { emailField: { autoFocus: false }, passwordField: { variant: 'outlined' } }
   */
  slotProps?: {
    emailField?: TextFieldProps;
    passwordField?: TextFieldProps;
    submitButton?: LoadingButtonProps;
    forgotPasswordLink?: LinkProps;
    signUpLink?: LinkProps;
  };
  /**
   * The prop used to customize the styles on the `SignInPage` container
   */
  sx?: SxProps;
}

/**
 *
 * Demos:
 *
 * - [Sign-in Page](https://mui.com/toolpad/core/react-sign-in-page/)
 *
 * API:
 *
 * - [SignInPage API](https://mui.com/toolpad/core/api/sign-in-page)
 */
function SignInPage(props: SignInPageProps) {
  const { providers, signIn, slots, slotProps, sx } = props;
  const theme = useTheme();
  const branding = React.useContext(BrandingContext);
  const docs = React.useContext(DocsContext);
  const router = React.useContext(RouterContext);
  const passkeyProvider = providers?.find((provider) => provider.id === 'passkey');
  const credentialsProvider = providers?.find((provider) => provider.id === 'credentials');
  const emailProvider = providers?.find((provider) => provider.id === 'nodemailer');
  const [{ loading, selectedProviderId, error, success }, setFormStatus] = React.useState<{
    loading: boolean;
    selectedProviderId?: SupportedAuthProvider;
    error?: string;
    success?: string;
  }>({
    selectedProviderId: undefined,
    loading: false,
    error: '',
    success: '',
  });

  const callbackUrl = router?.searchParams.get('callbackUrl') ?? '/';
  const singleProvider = React.useMemo(() => providers?.length === 1, [providers]);
  const isOauthProvider = React.useCallback(
    (provider?: SupportedAuthProvider) =>
      provider && provider !== 'credentials' && provider !== 'nodemailer' && provider !== 'passkey',
    [],
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        ...sx,
      }}
    >
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: 'background.paper',
            borderRadius: 1,
            p: 4,
            border: '1px solid',
            borderColor: alpha(theme.palette.grey[400], 0.4),
            boxShadow: theme.shadows[4],
          }}
        >
          {branding?.logo}

          {slots?.title ? (
            <slots.title />
          ) : (
            <Typography
              variant="h5"
              color="textPrimary"
              sx={{
                my: theme.spacing(1),
                fontWeight: 600,
              }}
            >
              Sign in {branding?.title ? `to ${branding.title}` : null}
            </Typography>
          )}
          {slots?.subtitle ? (
            <slots.subtitle />
          ) : (
            <Typography variant="body2" color="textSecondary" gutterBottom textAlign="center">
              Welcome, please sign in to continue
            </Typography>
          )}
          <Box sx={{ mt: theme.spacing(1), width: '100%' }}>
            <Stack spacing={1}>
              {error && isOauthProvider(selectedProviderId) ? (
                <Alert severity="error">{error}</Alert>
              ) : null}
              {Object.values(providers ?? {})
                .filter((provider) => isOauthProvider(provider.id))
                .map((provider: AuthProvider) => {
                  return (
                    <form
                      key={provider.id}
                      onSubmit={async (event) => {
                        event.preventDefault();
                        setFormStatus({
                          error: '',
                          selectedProviderId: provider.id,
                          loading: true,
                        });
                        const oauthResponse = await signIn?.(provider, undefined, callbackUrl);
                        setFormStatus((prev) => ({
                          ...prev,
                          loading: oauthResponse?.error || docs ? false : prev.loading,
                          error: oauthResponse?.error,
                        }));
                      }}
                    >
                      <LoadingButton
                        key={provider.id}
                        variant="outlined"
                        type="submit"
                        fullWidth
                        size="large"
                        disableElevation
                        name="provider"
                        color="inherit"
                        loading={loading && selectedProviderId === provider.id}
                        value={provider.id}
                        startIcon={IconProviderMap.get(provider.id)}
                        sx={{
                          textTransform: 'capitalize',
                        }}
                      >
                        <span>Sign in with {provider.name}</span>
                      </LoadingButton>
                    </form>
                  );
                })}
            </Stack>

            {passkeyProvider ? (
              <React.Fragment>
                {singleProvider ? null : <Divider sx={{ mt: 2, mx: 0, mb: 1 }}>or</Divider>}
                {error && selectedProviderId === 'passkey' ? (
                  <Alert sx={{ my: 2 }} severity="error">
                    {error}
                  </Alert>
                ) : null}
                <Box
                  component="form"
                  onSubmit={async (event) => {
                    setFormStatus({
                      error: '',
                      selectedProviderId: passkeyProvider.id,
                      loading: true,
                    });
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    const passkeyResponse = await signIn?.(passkeyProvider, formData, callbackUrl);
                    setFormStatus((prev) => ({
                      ...prev,
                      loading: false,
                      error: passkeyResponse?.error,
                    }));
                  }}
                >
                  {slots?.emailField ? (
                    <slots.emailField {...slotProps?.emailField} />
                  ) : (
                    <Box sx={{ marginBottom: theme.spacing(1) }}>
                      <InputLabel shrink htmlFor="email-passkey" sx={{ marginBottom: 0 }}>
                        Email
                      </InputLabel>
                      <TextField
                        required
                        slotProps={{
                          htmlInput: {
                            sx: {
                              paddingTop: theme.spacing(1),
                              paddingBottom: theme.spacing(1),
                            },
                          },
                          inputLabel: {
                            sx: {
                              lineHeight: theme.typography.pxToRem(12),
                            },
                          },
                        }}
                        fullWidth
                        placeholder="your@email.com"
                        id="email-passkey"
                        name="email"
                        type="email"
                        autoComplete="email-webauthn"
                        autoFocus={docs ? false : singleProvider}
                        {...slotProps?.emailField}
                      />
                    </Box>
                  )}

                  {slots?.submitButton ? (
                    <slots.submitButton {...slotProps?.submitButton} />
                  ) : (
                    <LoadingButton
                      type="submit"
                      fullWidth
                      size="large"
                      variant="outlined"
                      disableElevation
                      startIcon={IconProviderMap.get(passkeyProvider.id)}
                      color="inherit"
                      loading={loading && selectedProviderId === passkeyProvider.id}
                      sx={{
                        mt: 3,
                        mb: 2,
                        textTransform: 'capitalize',
                      }}
                      {...slotProps?.submitButton}
                    >
                      Sign in with {passkeyProvider.name || 'Passkey'}
                    </LoadingButton>
                  )}
                </Box>
              </React.Fragment>
            ) : null}

            {emailProvider ? (
              <React.Fragment>
                {singleProvider ? null : <Divider sx={{ mt: 2, mx: 0, mb: 1 }}>or</Divider>}
                {error && selectedProviderId === 'nodemailer' ? (
                  <Alert sx={{ my: 2 }} severity="error">
                    {error}
                  </Alert>
                ) : null}
                {success && selectedProviderId === 'nodemailer' ? (
                  <Alert sx={{ my: 2 }} severity="success">
                    {success}
                  </Alert>
                ) : null}
                <Box
                  component="form"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    setFormStatus({
                      error: '',
                      selectedProviderId: emailProvider.id,
                      loading: true,
                    });
                    const formData = new FormData(event.currentTarget);
                    const emailResponse = await signIn?.(emailProvider, formData, callbackUrl);
                    setFormStatus((prev) => ({
                      ...prev,
                      loading: false,
                      error: emailResponse?.error,
                      success: emailResponse?.success,
                    }));
                  }}
                >
                  <Box sx={{ marginBottom: theme.spacing(1) }}>
                    <InputLabel shrink htmlFor="email-nodemailer" sx={{ marginBottom: 0 }}>
                      Email
                    </InputLabel>
                    <TextField
                      required
                      slotProps={{
                        htmlInput: {
                          sx: {
                            paddingTop: theme.spacing(1),
                            paddingBottom: theme.spacing(1),
                          },
                        },
                        inputLabel: {
                          sx: {
                            lineHeight: theme.typography.pxToRem(12),
                          },
                        },
                      }}
                      fullWidth
                      placeholder="your@email.com"
                      name="email"
                      id="email-nodemailer"
                      type="email"
                      autoComplete="email-nodemailer"
                      autoFocus={docs ? false : singleProvider}
                      {...slotProps?.emailField}
                    />
                  </Box>

                  {slots?.submitButton ? (
                    <slots.submitButton {...slotProps?.submitButton} />
                  ) : (
                    <LoadingButton
                      type="submit"
                      fullWidth
                      size="large"
                      variant="outlined"
                      disableElevation
                      id="submit-nodemailer"
                      color="inherit"
                      loading={loading && selectedProviderId === emailProvider.id}
                      sx={{
                        mt: 3,
                        mb: 2,
                        textTransform: 'capitalize',
                      }}
                      {...slotProps?.submitButton}
                    >
                      Sign in with {emailProvider.name || 'Email'}
                    </LoadingButton>
                  )}
                </Box>
              </React.Fragment>
            ) : null}

            {credentialsProvider ? (
              <React.Fragment>
                {singleProvider ? null : <Divider sx={{ mt: 2, mx: 0, mb: 1 }}>or</Divider>}
                {error && selectedProviderId === 'credentials' ? (
                  <Alert sx={{ my: 2 }} severity="error">
                    {error}
                  </Alert>
                ) : null}
                <Box
                  component="form"
                  onSubmit={async (event) => {
                    setFormStatus({
                      error: '',
                      selectedProviderId: credentialsProvider.id,
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
                  {slots?.emailField ? (
                    <slots.emailField {...slotProps?.emailField} />
                  ) : (
                    <Box sx={{ marginBottom: theme.spacing(1) }}>
                      <InputLabel shrink htmlFor="email" sx={{ marginBottom: 0 }}>
                        Email
                      </InputLabel>
                      <TextField
                        required
                        slotProps={{
                          htmlInput: {
                            sx: {
                              paddingTop: theme.spacing(1),
                              paddingBottom: theme.spacing(1),
                            },
                          },
                          inputLabel: {
                            sx: {
                              lineHeight: theme.typography.pxToRem(12),
                            },
                          },
                        }}
                        placeholder="your@email.com"
                        fullWidth
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        autoFocus={docs ? false : singleProvider}
                        {...slotProps?.emailField}
                      />
                    </Box>
                  )}

                  {slots?.passwordField ? (
                    <slots.passwordField {...slotProps?.passwordField} />
                  ) : (
                    <React.Fragment>
                      <InputLabel shrink htmlFor="password" sx={{ marginBottom: 0 }}>
                        Password
                      </InputLabel>

                      <TextField
                        required
                        fullWidth
                        slotProps={{
                          htmlInput: {
                            sx: {
                              paddingTop: theme.spacing(1),
                              paddingBottom: theme.spacing(1),
                            },
                          },
                          inputLabel: {
                            sx: {
                              lineHeight: theme.typography.pxToRem(16),
                            },
                          },
                        }}
                        name="password"
                        type="password"
                        id="password"
                        placeholder="******"
                        autoComplete="current-password"
                        {...slotProps?.passwordField}
                      />
                    </React.Fragment>
                  )}

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
                  >
                    <FormControlLabel
                      control={<Checkbox name="remember" value="true" color="primary" />}
                      label="Remember me"
                      slotProps={{ typography: { color: 'textSecondary' } }}
                    />
                    {slots?.forgotPasswordLink ? (
                      <slots.forgotPasswordLink {...slotProps?.forgotPasswordLink} />
                    ) : null}
                  </Stack>
                  {slots?.submitButton ? (
                    <slots.submitButton {...slotProps?.submitButton} />
                  ) : (
                    <LoadingButton
                      type="submit"
                      fullWidth
                      size="large"
                      variant="contained"
                      disableElevation
                      color="primary"
                      loading={loading && selectedProviderId === credentialsProvider.id}
                      sx={{
                        mt: 3,
                        mb: 2,
                        textTransform: 'capitalize',
                      }}
                      {...slotProps?.submitButton}
                    >
                      Sign in
                    </LoadingButton>
                  )}

                  {slots?.signUpLink ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      {slots?.signUpLink ? <slots.signUpLink {...slotProps?.signUpLink} /> : null}
                    </Box>
                  ) : null}
                </Box>
              </React.Fragment>
            ) : null}
          </Box>
        </Box>
      </Container>
    </Box>
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
   * The props used for each slot inside.
   * @default {}
   * @example { emailField: { autoFocus: false } }
   * @example { passwordField: { variant: 'outlined' } }
   * @example { emailField: { autoFocus: false }, passwordField: { variant: 'outlined' } }
   */
  slotProps: PropTypes.shape({
    emailField: PropTypes.object,
    forgotPasswordLink: PropTypes.object,
    passwordField: PropTypes.object,
    signUpLink: PropTypes.object,
    submitButton: PropTypes.object,
  }),
  /**
   * The components used for each slot inside.
   * @default {}
   * @example { forgotPasswordLink: <Link href="/forgot-password">Forgot password?</Link> }
   * @example { signUpLink: <Link href="/sign-up">Sign up</Link> }
   */
  slots: PropTypes.shape({
    emailField: PropTypes.elementType,
    forgotPasswordLink: PropTypes.elementType,
    passwordField: PropTypes.elementType,
    signUpLink: PropTypes.elementType,
    submitButton: PropTypes.elementType,
    subtitle: PropTypes.elementType,
    title: PropTypes.elementType,
  }),
  /**
   * The prop used to customize the styles on the `SignInPage` container
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
} as any;

export { SignInPage };
