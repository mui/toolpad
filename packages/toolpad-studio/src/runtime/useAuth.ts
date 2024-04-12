import * as React from 'react';
import * as appDom from '@toolpad/studio-runtime/appDom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppHost } from '@toolpad/studio-runtime';

const AUTH_API_PATH = '/api/auth';

const AUTH_SESSION_PATH = `${AUTH_API_PATH}/session`;
const AUTH_CSRF_PATH = `${AUTH_API_PATH}/csrf`;
const AUTH_SIGNIN_PATH = `${AUTH_API_PATH}/signin`;
const AUTH_SIGNOUT_PATH = `${AUTH_API_PATH}/signout`;

export type AuthProvider = 'github' | 'google' | 'azure-ad' | 'credentials';

function isResponseJSON(response: Response): boolean {
  return response.headers.get('content-type')?.includes('application/json') || false;
}

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
  signIn: (
    provider: AuthProvider,
    payload?: Record<string, unknown>,
    isLocalProvider?: boolean,
  ) => void | Promise<void>;
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
  signInPagePath: string;
}

export function useAuth({ dom, basename, signInPagePath }: UseAuthInput): AuthPayload {
  const location = useLocation();
  const navigate = useNavigate();

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
    let csrfToken = '';
    try {
      const csrfResponse = await fetch(`${basename}${AUTH_CSRF_PATH}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (isResponseJSON(csrfResponse)) {
        csrfToken = (await csrfResponse.json())?.csrfToken;
      }
    } catch (error) {
      console.error((error as Error).message);
    }

    return csrfToken ?? '';
  }, [basename]);

  const signOut = React.useCallback(async () => {
    setIsSigningOut(true);

    const csrfToken = await getCsrfToken();

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

    if (location.pathname !== signInPagePath) {
      navigate(signInPagePath);
    }
  }, [basename, getCsrfToken, location.pathname, navigate, signInPagePath]);

  const getSession = React.useCallback(async () => {
    setIsSigningIn(true);

    await getCsrfToken();

    try {
      setIsSigningIn(true);
      const sessionResponse = await fetch(`${basename}${AUTH_SESSION_PATH}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (isResponseJSON(sessionResponse)) {
        const currentSession = await sessionResponse.json();

        setSession(currentSession);

        if (!currentSession) {
          signOut();
        }
      } else {
        signOut();
      }
    } catch (error) {
      console.error((error as Error).message);
      signOut();
    }

    setIsSigningIn(false);
  }, [basename, getCsrfToken, signOut]);

  const signIn = React.useCallback(
    async (provider: AuthProvider, payload?: Record<string, unknown>, isLocalProvider = false) => {
      setIsSigningIn(true);

      const csrfToken = await getCsrfToken();

      try {
        const signInResponse = await fetch(
          isLocalProvider
            ? `${basename}${AUTH_API_PATH}/callback/${provider}`
            : `${basename}${AUTH_SIGNIN_PATH}/${provider}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'X-Auth-Return-Redirect': '1',
            },
            body: new URLSearchParams({ ...payload, csrfToken }),
          },
        );

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

  const appHost = useAppHost();

  React.useEffect(() => {
    if (hasAuthentication && !appHost.isCanvas) {
      getSession();
    }
  }, [getCsrfToken, getSession, hasAuthentication, appHost.isCanvas]);

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
