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
   * The custom component for the page footer.
   * @default null
   */
  footer?: React.ElementType;
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
  /**
   * A component to override the entire form section
   * @default form
   */
  form?: React.JSXElementConstructor<HTMLFormElement>;
  /**
   * A component to add content to the space between the form fields and the submit button
   * @default null
   */
  formFooter?: React.ElementType;
  /**
   * A component to add additional fields to the form
   * @default null
   */
  formFields?: React.ElementType;
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
   * @example { footer: <Box display="flex" justifyContent="center" /><Link href="/sign-up">Sign In</Link></Box> }
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
    form?: Partial<React.FormHTMLAttributes<HTMLFormElement>>;
    formFields?: React.ComponentProps<any>;
    formFooter?: React.ComponentProps<any>;
    footer?: React.ComponentProps<any>;
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
    (provider) => provider.id === 'nodemailer' || provider.id === 'firebase-email',
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
      provider !== 'firebase-email' &&
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
          <Box width="100%">
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
                      {...slotProps?.form}
                    >
                      {slots?.formFooter ? <slots?.formFooter {...slotProps?.formFooter} /> : null}
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
                  <Alert sx={{ mt: 1, mb: 3 }} severity="error">
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
                  {...slotProps?.form}
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
                  {slots?.formFields ? <slots.formFields {...slotProps?.formFields} /> : null}
                  {slots?.formFooter ? <slots?.formFooter {...slotProps?.formFooter} /> : null}
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
                (selectedProviderId === 'nodemailer' || selectedProviderId === 'firebase-email') ? (
                  <Alert sx={{ mt: 1, mb: 2 }} severity="error">
                    {error}
                  </Alert>
                ) : null}
                {success &&
                (selectedProviderId === 'nodemailer' || selectedProviderId === 'firebase-email') ? (
                  <Alert sx={{ mt: 1, mb: 2 }} severity="success">
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
                  {...slotProps?.form}
                >
                  {slots?.emailField ? (
                    <slots.emailField {...slotProps?.emailField} />
                  ) : (
                    <TextField
                      {...getCommonTextFieldProps(theme, {
                        label: 'Email',
                        placeholder: 'your@email.com',
                        name: 'email',
                        id: `email-magicLink`,
                        type: 'email',
                        autoComplete: `email-magicLink`,
                        autoFocus: singleProvider,
                        ...slotProps?.emailField,
                      })}
                    />
                  )}
                  {slots?.formFields ? <slots.formFields {...slotProps?.formFields} /> : null}
                  {slots?.formFooter ? <slots?.formFooter {...slotProps?.formFooter} /> : null}
                  {slots?.submitButton ? (
                    <slots.submitButton {...slotProps?.submitButton} />
                  ) : (
                    <LoadingButton
                      type="submit"
                      fullWidth
                      size="large"
                      variant="outlined"
                      disableElevation
                      id="submit-email"
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
                  <Alert sx={{ mt: 1, mb: 3 }} severity="error">
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
                  {...slotProps?.form}
                >
                  <Stack direction="column" spacing={2} sx={{ mb: 0 }}>
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
                    {slots?.formFields ? <slots.formFields {...slotProps?.formFields} /> : null}
                  </Stack>
                  {slots?.formFields ? <slots.formFields {...slotProps?.formFields} /> : null}
                  {slots?.formFooter ? <slots?.formFooter {...slotProps?.formFooter} /> : null}
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

                  {slots?.footer ? <slots.footer {...slotProps?.footer} /> : null}
                </Box>
              </React.Fragment>
            ) : null}
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
    footer: PropTypes.object,
    submitButton: PropTypes.object,
  }),
  /**
   * The components used for each slot inside.
   * @default {}
   * @example { footer: <Box display="flex" justifyContent="center" /><Link href="/sign-up">Sign In</Link></Box> }
   */
  slots: PropTypes.shape({
    emailField: PropTypes.elementType,
    passwordField: PropTypes.elementType,
    footer: PropTypes.elementType,
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
