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

export type SupportedAuthProvider =
  | SupportedOAuthProvider
  | 'credentials'
  | 'passkey'
  | 'nodemailer'
  | string;

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
