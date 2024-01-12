import * as React from 'react';
import * as appDom from '../appDom';

const AUTH_API_PATH = '/api/auth';

export const AUTH_SESSION_PATH = `${AUTH_API_PATH}/session`;
export const AUTH_CSRF_PATH = `${AUTH_API_PATH}/csrf`;
export const AUTH_SIGNIN_PATH = `${AUTH_API_PATH}/signin`;
export const AUTH_SIGNOUT_PATH = `${AUTH_API_PATH}/signout`;

export type AuthProvider = 'github' | 'google';

export interface AuthSession {
  user: {
    name: string;
    email: string;
    image: string;
    roles: string[];
  };
}

export interface AuthPayload {
  session: AuthSession | null;
  signIn: (provider: AuthProvider) => void | Promise<void>;
  signOut: () => void | Promise<void>;
  isSigningIn: boolean;
  isSigningOut: boolean;
  authProviders: AuthProvider[];
  hasAuthentication: boolean;
}

export const AuthContext = React.createContext<AuthPayload>({
  session: null,
  signIn: () => {},
  signOut: () => {},
  isSigningIn: false,
  isSigningOut: false,
  authProviders: [],
  hasAuthentication: false,
});

interface UseAuthInput {
  dom: appDom.RenderTree;
  basename: string;
}

export function useAuth({ dom, basename }: UseAuthInput): AuthPayload {
  const authProviders = React.useMemo(() => {
    const app = appDom.getApp(dom);
    const authProviderConfigs = app.attributes.authentication?.providers ?? [];
    return authProviderConfigs.map((providerConfig) => providerConfig.provider);
  }, [dom]);

  const hasAuthentication = authProviders.length > 0;

  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [isSigningIn, setIsSigningIn] = React.useState(true);
  const [isSigningOut, setIsSigningOut] = React.useState(true);

  const getCsrfToken = React.useCallback(async () => {
    const csrfResponse = await fetch(`${basename}${AUTH_CSRF_PATH}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const { csrfToken } = await csrfResponse.json();

    return csrfToken ?? '';
  }, [basename]);

  const signOut = React.useCallback(async () => {
    setIsSigningOut(true);

    let csrfToken = '';
    try {
      csrfToken = await getCsrfToken();
    } catch (error) {
      console.error((error as Error).message);
    }

    try {
      await fetch(`${basename}${AUTH_SIGNOUT_PATH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Auth-Return-Redirect': '1',
        },
        body: new URLSearchParams({ csrfToken }),
      });
    } catch (error) {
      console.error((error as Error).message);
    }

    setSession(null);
    setIsSigningOut(false);
  }, [basename, getCsrfToken]);

  const getSession = React.useCallback(async () => {
    try {
      setIsSigningIn(true);
      const sessionResponse = await fetch(`${basename}${AUTH_SESSION_PATH}`);
      setSession(await sessionResponse.json());
    } catch (error) {
      console.error((error as Error).message);
      signOut();
    }

    setIsSigningIn(false);
  }, [basename, signOut]);

  const signIn = React.useCallback(
    async (provider: AuthProvider) => {
      try {
        setIsSigningIn(true);

        const csrfToken = await getCsrfToken();

        const signInResponse = await fetch(`${basename}${AUTH_SIGNIN_PATH}/${provider}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Auth-Return-Redirect': '1',
          },
          body: new URLSearchParams({ csrfToken }),
        });
        const { url: signInUrl } = await signInResponse.json();

        window.location.href = signInUrl;
      } catch (error) {
        console.error((error as Error).message);
        signOut();

        setIsSigningIn(false);
      }
    },
    [basename, getCsrfToken, signOut],
  );

  React.useEffect(() => {
    if (hasAuthentication) {
      getSession();
    }
  }, [getSession, hasAuthentication]);

  return {
    session,
    signIn,
    signOut,
    isSigningIn,
    isSigningOut,
    authProviders,
    hasAuthentication,
  };
}
