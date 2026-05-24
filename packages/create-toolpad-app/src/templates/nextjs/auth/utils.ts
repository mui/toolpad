import type { SupportedAuthProvider } from '@toolpad/core/AuthPage';

export function requiresIssuer(provider: SupportedAuthProvider) {
  return (
    provider === 'cognito' ||
    provider === 'fusionauth' ||
    provider === 'keycloak' ||
    provider === 'okta'
  );
}

export function requiresTenantId(provider: SupportedAuthProvider) {
  return provider === 'microsoft-entra-id' || provider === 'fusionauth';
}
