'use client';

import * as React from 'react';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import Button, { ButtonProps } from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link, { LinkProps } from '@mui/material/Link';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import GitHubIcon from '@mui/icons-material/GitHub';
import PasswordIcon from '@mui/icons-material/Password';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import AppleIcon from '@mui/icons-material/Apple';
import { alpha, useTheme, SxProps, type Theme } from '@mui/material/styles';
import GoogleIcon from '../shared/icons/Google';
import FacebookIcon from '../shared/icons/Facebook';
import TwitterIcon from '../shared/icons/Twitter';
import InstagramIcon from '../shared/icons/Instagram';
import TikTokIcon from '../shared/icons/TikTok';
import LinkedInIcon from '../shared/icons/LinkedIn';
import SlackIcon from '../shared/icons/Slack';
import SpotifyIcon from '../shared/icons/Spotify';
import TwitchIcon from '../shared/icons/Twitch';
import DiscordIcon from '../shared/icons/Discord';
import LineIcon from '../shared/icons/Line';
import Auth0Icon from '../shared/icons/Auth0';
import MicrosoftEntraIdIcon from '../shared/icons/MicrosoftEntra';
import CognitoIcon from '../shared/icons/Cognito';
import GitLabIcon from '../shared/icons/GitLab';
import KeycloakIcon from '../shared/icons/Keycloak';
import OktaIcon from '../shared/icons/Okta';
import FusionAuthIcon from '../shared/icons/FusionAuth';
import { BrandingContext, RouterContext } from '../shared/context';
import { LocaleText, useLocaleText } from '../AppProvider/LocalizationProvider';

const mergeSlotSx = (defaultSx: SxProps<Theme>, slotProps?: { sx?: SxProps<Theme> }) => {
  if (Array.isArray(slotProps?.sx)) {
    return [defaultSx, ...slotProps.sx];
  }

  if (slotProps?.sx) {
    return [defaultSx, slotProps?.sx];
  }

  return [defaultSx];
};

const getCommonTextFieldProps = (theme: Theme, baseProps: TextFieldProps = {}): TextFieldProps => ({
  required: true,
  fullWidth: true,
  ...baseProps,
  slotProps: {
    ...baseProps.slotProps,
    htmlInput: {
      ...baseProps.slotProps?.htmlInput,
      sx: mergeSlotSx(
        {
          paddingTop: theme.spacing(1),
          paddingBottom: theme.spacing(1),
        },
        typeof baseProps.slotProps?.htmlInput === 'function' ? {} : baseProps.slotProps?.htmlInput,
      ),
    },
    inputLabel: {
      ...baseProps.slotProps?.inputLabel,
      sx: mergeSlotSx(
        {
          lineHeight: theme.typography.pxToRem(12),
          fontSize: theme.typography.pxToRem(14),
        },
        typeof baseProps.slotProps?.inputLabel === 'function'
          ? {}
          : baseProps.slotProps?.inputLabel,
      ),
    },
  },
});

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

interface SignUpPageLocaleText {
  signUpTitle: string | ((brandingTitle?: string) => string);
  signUpSubtitle: string;
  providerSignUpTitle: (provider: string) => string;
  email: string;
  password: string;
  confirmPassword: string;
  or: string;
  with: string;
  passkey: string;
  to: string;
  terms: string;
  privacy: string;
  agree: string;
  and: string;
  passwordsDoNotMatch: string;
}

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

export interface SignUpActionResponse {
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

export interface SignUpPageSlots {
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
   * The custom confirm password field component used in the credentials form.
   * @default TextField
   */
  confirmPasswordField?: React.JSXElementConstructor<TextFieldProps>;
  /**
   * The custom submit button component used in the credentials form.
   * @default Button
   */
  submitButton?: React.JSXElementConstructor<ButtonProps>;
  /**
   * The custom terms and conditions link component.
   * @default Link
   */
  termsLink?: string;
  /**
   * The custom privacy policy link component.
   * @default Link
   */
  privacyLink?: string;
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

export interface SignUpPageProps {
  /**
   * The list of authentication providers to display.
   * @default []
   */
  providers?: AuthProvider[];
  /**
   * Callback fired when a user signs up.
   * @param {AuthProvider} provider The authentication provider.
   * @param {FormData} formData The form data if the provider id is 'credentials'.\
   * @param {string} callbackUrl The URL to redirect to after signing up.
   * @returns {void|Promise<SignUpActionResponse>}
   * @default undefined
   */
  signUp?: (
    provider: AuthProvider,
    formData?: any,
    callbackUrl?: string,
  ) => void | Promise<SignUpActionResponse> | undefined;
  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots?: SignUpPageSlots;
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps?: {
    emailField?: TextFieldProps;
    passwordField?: TextFieldProps;
    confirmPasswordField?: TextFieldProps;
    submitButton?: ButtonProps;
    termsLink?: LinkProps;
    privacyLink?: LinkProps;
    form?: Partial<React.FormHTMLAttributes<HTMLFormElement>>;
    oAuthButton?: ButtonProps;
  };
  /**
   * The prop used to customize the styles on the `SignUpPage` container
   */
  sx?: SxProps;
  /**
   * The labels for the account component.
   */
  localeText?: Partial<SignUpPageLocaleText>;
}

const defaultLocaleText: Pick<LocaleText, keyof SignUpPageLocaleText> = {
  signUpTitle: (brandingTitle?: string) =>
    brandingTitle ? `Sign up to ${brandingTitle}` : 'Sign up',
  signUpSubtitle: 'Create your account',
  providerSignUpTitle: (provider: string) => `Sign up with ${provider}`,
  email: 'Email',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  or: 'or',
  with: 'with',
  passkey: 'Passkey',
  to: 'to',
  terms: 'Terms and Conditions',
  privacy: 'Privacy Policy',
  agree: 'I agree to the',
  and: 'and',
  passwordsDoNotMatch: 'Passwords do not match',
};

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
function SignUpPage(props: SignUpPageProps) {
  const { providers, signUp, slots, slotProps, sx, localeText: propsLocaleText } = props;
  const theme = useTheme();
  const branding = React.useContext(BrandingContext);
  const router = React.useContext(RouterContext);
  const globalLocaleText = useLocaleText();
  const localeText = { ...defaultLocaleText, ...globalLocaleText, ...propsLocaleText };

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
  const hasOauthProvider = React.useMemo(
    () => providers?.some((provider) => isOauthProvider(provider.id)),
    [isOauthProvider, providers],
  );

  const isEmailProvider = React.useCallback(
    (provider?: SupportedAuthProvider) => provider && provider === 'nodemailer',
    [],
  );

  const isCredentialsProvider = React.useCallback(
    (provider?: SupportedAuthProvider) => provider && provider === 'credentials',
    [],
  );

  const [currentInputedPassword, setPassword] = React.useState<string>();
  const [currentInputedConfirmedPassword, setConfirmPassword] = React.useState<string>();

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
        <Stack
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: 'background.paper',
            borderRadius: 1,
            p: 4,
            gap: 1,
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
              component="h1"
              color="textPrimary"
              sx={{
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              {typeof localeText.signUpTitle === 'string'
                ? localeText.signUpTitle
                : localeText.signUpTitle(branding?.title)}
            </Typography>
          )}
          {slots?.subtitle ? (
            <slots.subtitle />
          ) : (
            <Typography variant="body2" color="textSecondary" gutterBottom textAlign="center">
              {localeText?.signUpSubtitle}
            </Typography>
          )}
          <Box sx={{ width: '100%' }}>
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
                        const oauthResponse = signUp
                          ? await signUp(provider, undefined, callbackUrl)
                          : { error: 'No signUp function provided' };
                        setFormStatus((prev) => ({
                          ...prev,
                          loading: oauthResponse?.error ? false : prev.loading,
                          error: oauthResponse?.error,
                        }));
                      }}
                      {...slotProps?.form}
                    >
                      <Button
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
                        {...slotProps?.oAuthButton}
                      >
                        <span>{localeText.providerSignUpTitle(provider.name)}</span>
                      </Button>
                    </form>
                  );
                })}
            </Stack>

            {Object.values(providers ?? {})
              .filter((provider) => !isOauthProvider(provider.id))
              .map((provider: AuthProvider, index: number) => {
                return (
                  <React.Fragment key={provider.id}>
                    {isEmailProvider(provider.id) ? (
                      <React.Fragment>
                        {hasOauthProvider || index > 0 ? (
                          <Divider sx={{ mt: 2, mx: 0, mb: 1 }}>{localeText.or}</Divider>
                        ) : null}
                        {error && selectedProviderId === 'nodemailer' ? (
                          <Alert sx={{ my: 1 }} severity="error">
                            {error}
                          </Alert>
                        ) : null}
                        {success && selectedProviderId === 'nodemailer' ? (
                          <Alert sx={{ my: 1 }} severity="success">
                            {success}
                          </Alert>
                        ) : null}
                        <Box
                          component="form"
                          onSubmit={async (event) => {
                            event.preventDefault();
                            setFormStatus({
                              error: '',
                              selectedProviderId: provider.id,
                              loading: true,
                            });
                            const formData = new FormData(event.currentTarget);
                            const emailResponse = await signUp?.(provider, formData, callbackUrl);
                            setFormStatus((prev) => ({
                              ...prev,
                              loading: false,
                              error: emailResponse?.error,
                              success: emailResponse?.success,
                            }));
                          }}
                          {...slotProps?.form}
                        >
                          {slots?.emailField ? (
                            <slots.emailField {...slotProps?.emailField} />
                          ) : (
                            <TextField
                              {...getCommonTextFieldProps(theme, {
                                label: localeText.email,
                                placeholder: 'your@email.com',
                                name: 'email',
                                id: 'email-nodemailer',
                                type: 'email',
                                autoComplete: 'email-nodemailer',
                                autoFocus: singleProvider,
                                sx: { mt: 1 },
                                ...slotProps?.emailField,
                              })}
                            />
                          )}
                          {slots?.submitButton ? (
                            <slots.submitButton {...slotProps?.submitButton} />
                          ) : (
                            <Button
                              type="submit"
                              fullWidth
                              size="large"
                              variant="outlined"
                              disableElevation
                              id="submit-nodemailer"
                              color="inherit"
                              loading={loading && selectedProviderId === provider.id}
                              sx={{
                                mt: 3,
                                mb: 2,
                                textTransform: 'capitalize',
                              }}
                              {...slotProps?.submitButton}
                            >
                              {localeText.providerSignUpTitle(
                                (provider.name || localeText.email).toLocaleLowerCase(),
                              )}
                            </Button>
                          )}
                        </Box>
                      </React.Fragment>
                    ) : null}

                    {isCredentialsProvider(provider.id) ? (
                      <React.Fragment>
                        {hasOauthProvider || index > 0 ? (
                          <Divider sx={{ mt: 2, mx: 0, mb: 1 }}>{localeText.or}</Divider>
                        ) : null}
                        {error && selectedProviderId === 'credentials' ? (
                          <Alert sx={{ mt: 1, mb: 2 }} severity="error">
                            {error}
                          </Alert>
                        ) : null}
                        <Box
                          component="form"
                          onSubmit={async (event) => {
                            setFormStatus({
                              error: '',
                              selectedProviderId: provider.id,
                              loading: true,
                            });
                            event.preventDefault();
                            const formData = new FormData(event.currentTarget);
                            const credentialsResponse = await signUp?.(
                              provider,
                              formData,
                              callbackUrl,
                            );
                            setFormStatus((prev) => ({
                              ...prev,
                              loading: false,
                              error: credentialsResponse?.error,
                            }));
                          }}
                          {...slotProps?.form}
                        >
                          <Stack direction="column" spacing={2} marginTop={1}>
                            {slots?.emailField ? (
                              <slots.emailField {...slotProps?.emailField} />
                            ) : (
                              <TextField
                                {...getCommonTextFieldProps(theme, {
                                  label: localeText.email,
                                  placeholder: 'your@email.com',
                                  id: 'email',
                                  name: 'email',
                                  type: 'email',
                                  autoComplete: 'email',
                                  autoFocus: singleProvider,
                                  ...slotProps?.emailField,
                                })}
                              />
                            )}
                            {slots?.passwordField ? (
                              <slots.passwordField {...slotProps?.passwordField} />
                            ) : (
                              <TextField
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                  setPassword(event.target.value);
                                }}
                                {...getCommonTextFieldProps(theme, {
                                  name: 'password',
                                  type: 'password',
                                  label: localeText.password,
                                  id: 'password',
                                  placeholder: '*****',
                                  autoComplete: 'new-password',
                                  ...slotProps?.passwordField,
                                })}
                              />
                            )}
                            {slots?.confirmPasswordField ? (
                              <slots.confirmPasswordField {...slotProps?.confirmPasswordField} />
                            ) : (
                              <TextField
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                  setConfirmPassword(event.target.value);
                                }}
                                error={currentInputedConfirmedPassword !== currentInputedPassword}
                                helperText={
                                  currentInputedConfirmedPassword !== currentInputedPassword
                                    ? localeText.passwordsDoNotMatch
                                    : undefined
                                }
                                {...getCommonTextFieldProps(theme, {
                                  name: 'confirmPassword',
                                  type: 'password',
                                  label: localeText.confirmPassword,
                                  id: 'confirm-password',
                                  placeholder: '*****',
                                  autoComplete: 'new-password',
                                  ...slotProps?.confirmPasswordField,
                                })}
                                {...getCommonTextFieldProps(theme, {
                                  name: 'confirmPassword',
                                  type: 'password',
                                  label: localeText.confirmPassword,
                                  id: 'confirm-password',
                                  placeholder: '*****',
                                  autoComplete: 'new-password',
                                  ...slotProps?.confirmPasswordField,
                                })}
                              />
                            )}

                            {slots?.termsLink || slots?.privacyLink ? (
                              <Box sx={{ mt: 2 }}>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  flexWrap="wrap"
                                  gap={0.5}
                                >
                                  <Typography variant="body2" color="text.secondary">
                                    {localeText.agree}
                                  </Typography>
                                  {slots?.termsLink ? (
                                    <Link href={slots?.termsLink} color="primary" variant="body2">
                                      {localeText.terms}
                                    </Link>
                                  ) : null}
                                  {slots?.termsLink && slots?.privacyLink ? (
                                    <Typography variant="body2" color="text.secondary">
                                      {localeText.and}
                                    </Typography>
                                  ) : null}
                                  {slots?.privacyLink ? (
                                    <Link href={slots?.privacyLink} color="primary" variant="body2">
                                      {localeText.privacy}
                                    </Link>
                                  ) : null}
                                </Stack>
                              </Box>
                            ) : null}
                          </Stack>
                          {slots?.submitButton ? (
                            <slots.submitButton {...slotProps?.submitButton} />
                          ) : (
                            <Button
                              type="submit"
                              fullWidth
                              size="large"
                              variant="outlined"
                              disableElevation
                              color="inherit"
                              loading={loading && selectedProviderId === provider.id}
                              sx={{
                                mt: 3,
                                mb: 2,
                                textTransform: 'capitalize',
                              }}
                              disabled={
                                currentInputedConfirmedPassword !== currentInputedPassword ||
                                currentInputedConfirmedPassword === undefined
                              }
                              {...slotProps?.submitButton}
                            >
                              {localeText.providerSignUpTitle(
                                (provider.name || localeText.password).toLocaleLowerCase(),
                              )}
                            </Button>
                          )}
                        </Box>
                      </React.Fragment>
                    ) : null}
                  </React.Fragment>
                );
              })}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

SignUpPage.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The labels for the account component.
   */
  localeText: PropTypes.object,
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
   * @returns {void|Promise<SignUpActionResponse>}
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
    form: PropTypes.object,
    oAuthButton: PropTypes.object,
    passwordField: PropTypes.object,
    rememberMe: PropTypes.object,
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
    rememberMe: PropTypes.elementType,
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

export { SignUpPage };
