'use client';

import * as React from 'react';
import PropTypes from 'prop-types';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton, { LoadingButtonProps } from '@mui/lab/LoadingButton';
import { alpha, useTheme, SxProps } from '@mui/material/styles';
import { LinkProps } from '@mui/material/Link';
import { BrandingContext, RouterContext } from '../shared/context';
import IconProviderMap from '../shared/icons/iconProviderMap';
import { getCommonTextFieldProps } from '../shared/utils';
import type { AuthProvider, AuthResponse, SupportedAuthProvider } from '../auth/types';

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
   * The custom submit button component used in the credentials form.
   * @default LoadingButton
   */
  submitButton?: React.JSXElementConstructor<LoadingButtonProps>;

  /**
   * The custom sign in link component used in the credentials form.
   * @default Link
   */
  signInLink?: React.JSXElementConstructor<LinkProps>;
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
   * @param {string} callbackUrl The URL to redirect to after signing in.
   * @returns {void|Promise<AuthResponse>}
   * @default undefined
   */
  signUp?: (
    provider: AuthProvider,
    formData?: any,
    callbackUrl?: string,
  ) => void | Promise<AuthResponse> | undefined;
  /**
   * The components used for each slot inside.
   * @default {}
   * @example { signInLink: <Link href="/sign-up">Sign In</Link> }
   */
  slots?: SignUpPageSlots;
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
    signInLink?: LinkProps;
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
 * - [Sign-up Page](https://mui.com/toolpad/core/react-sign-up-page/)
 *
 * API:
 *
 * - [SignUpPage API](https://mui.com/toolpad/core/api/sign-up-page)
 */
function SignUpPage(props: SignUpPageProps) {
  const { providers, signUp, slots, slotProps, sx } = props;
  const theme = useTheme();
  const branding = React.useContext(BrandingContext);
  const router = React.useContext(RouterContext);
  const passkeyProvider = providers?.find((provider) => provider.id === 'passkey');
  const credentialsProvider = providers?.find((provider) => provider.id === 'credentials');
  const emailProvider = providers?.find(
    (provider) => provider.id === 'nodemailer' || provider.id === 'email',
  );
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
      provider &&
      provider !== 'credentials' &&
      provider !== 'nodemailer' &&
      provider !== 'email' &&
      provider !== 'passkey',
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
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              Sign up {branding?.title ? `to ${branding.title}` : null}
            </Typography>
          )}
          {slots?.subtitle ? (
            <slots.subtitle />
          ) : (
            <Typography variant="body2" color="textSecondary" gutterBottom textAlign="center">
              Welcome, please sign up to continue
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
                        const oauthResponse = await signUp?.(provider, undefined, callbackUrl);
                        setFormStatus((prev) => ({
                          ...prev,
                          loading: oauthResponse?.error ? false : prev.loading,
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
                        <span>Sign up with {provider.name}</span>
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
                    const passkeyResponse = await signUp?.(passkeyProvider, formData, callbackUrl);
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
                    <TextField
                      {...getCommonTextFieldProps(theme, {
                        label: 'Email',
                        placeholder: 'your@email.com',
                        id: 'email-passkey',
                        name: 'email',
                        type: 'email',
                        autoComplete: 'email-webauthn',
                        autoFocus: singleProvider,
                        ...slotProps?.emailField,
                      })}
                    />
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
                      Sign up with {passkeyProvider.name || 'Passkey'}
                    </LoadingButton>
                  )}
                </Box>
              </React.Fragment>
            ) : null}

            {emailProvider ? (
              <React.Fragment>
                {singleProvider ? null : <Divider sx={{ mt: 2, mx: 0, mb: 1 }}>or</Divider>}
                {error &&
                (selectedProviderId === 'nodemailer' || selectedProviderId === 'email') ? (
                  <Alert sx={{ my: 2 }} severity="error">
                    {error}
                  </Alert>
                ) : null}
                {success &&
                (selectedProviderId === 'nodemailer' || selectedProviderId === 'email') ? (
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
                    const emailResponse = await signUp?.(emailProvider, formData, callbackUrl);
                    setFormStatus((prev) => ({
                      ...prev,
                      loading: false,
                      error: emailResponse?.error,
                      success: emailResponse?.success,
                    }));
                  }}
                >
                  {slots?.emailField ? (
                    <slots.emailField {...slotProps?.emailField} />
                  ) : (
                    <TextField
                      {...getCommonTextFieldProps(theme, {
                        label: 'Email',
                        placeholder: 'your@email.com',
                        name: 'email',
                        id: `email-nodemailer`,
                        type: 'email',
                        autoComplete: `email-nodemailer`,
                        autoFocus: singleProvider,
                        ...slotProps?.emailField,
                      })}
                    />
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
                      Sign up with Email
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
                    const credentialsResponse = await signUp?.(
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
                  <Stack direction="column" spacing={2} sx={{ mb: 2 }}>
                    {slots?.emailField ? (
                      <slots.emailField {...slotProps?.emailField} />
                    ) : (
                      <TextField
                        {...getCommonTextFieldProps(theme, {
                          label: 'Email',
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
                        {...getCommonTextFieldProps(theme, {
                          name: 'password',
                          type: 'password',
                          label: 'Password',
                          id: 'password',
                          placeholder: '*****',
                          autoComplete: 'current-password',
                          ...slotProps?.passwordField,
                        })}
                      />
                    )}
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
                      Sign up
                    </LoadingButton>
                  )}

                  {slots?.signInLink ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      {slots?.signInLink ? <slots.signInLink {...slotProps?.signInLink} /> : null}
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

SignUpPage.propTypes /* remove-proptypes */ = {
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
   * Callback fired when a user signs up.
   * @param {AuthProvider} provider The authentication provider.
   * @param {FormData} formData The form data if the provider id is 'credentials'.\
   * @param {string} callbackUrl The URL to redirect to after signing in.
   * @returns {void|Promise<AuthResponse>}
   * @default undefined
   */
  signUp: PropTypes.func,
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
    signInLink: PropTypes.object,
    submitButton: PropTypes.object,
  }),
  /**
   * The components used for each slot inside.
   * @default {}
   * @example { signInLink: <Link href="/sign-up">Sign In</Link> }
   */
  slots: PropTypes.shape({
    emailField: PropTypes.elementType,
    passwordField: PropTypes.elementType,
    signInLink: PropTypes.elementType,
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
