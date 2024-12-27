import * as React from 'react';
import GitHubIcon from '@mui/icons-material/GitHub';
import PasswordIcon from '@mui/icons-material/Password';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import AppleIcon from '@mui/icons-material/Apple';
import type { SupportedAuthProvider } from '../../auth';
import GoogleIcon from './Google';
import FacebookIcon from './Facebook';
import TwitterIcon from './Twitter';
import InstagramIcon from './Instagram';
import TikTokIcon from './TikTok';
import LinkedInIcon from './LinkedIn';
import SlackIcon from './Slack';
import SpotifyIcon from './Spotify';
import TwitchIcon from './Twitch';
import DiscordIcon from './Discord';
import LineIcon from './Line';
import Auth0Icon from './Auth0';
import MicrosoftEntraIdIcon from './MicrosoftEntra';
import CognitoIcon from './Cognito';
import GitLabIcon from './GitLab';
import KeycloakIcon from './Keycloak';
import OktaIcon from './Okta';
import FusionAuthIcon from './FusionAuth';

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

export default IconProviderMap;
