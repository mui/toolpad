import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from './api';

const AUTH_API_PATH = `${window.location.origin}/api/auth`;

const AUTH_SESSION_PATH = `${AUTH_API_PATH}/session`;
const AUTH_CSRF_PATH = `${AUTH_API_PATH}/csrf`;
const AUTH_SIGNIN_PATH = `${AUTH_API_PATH}/signin`;
const AUTH_SIGNOUT_PATH = `${AUTH_API_PATH}/signout`;

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
  isLoadingAuthProviders: boolean;
  hasAuthentication: boolean;
}

export const AuthContext = React.createContext<AuthPayload>({
  session: null,
  signIn: () => {},
  signOut: () => {},
  isSigningIn: false,
  isSigningOut: false,
  authProviders: [],
  isLoadingAuthProviders: false,
  hasAuthentication: false,
});

export function useAuth(): AuthPayload {
  const { data: authProviders = [], isLoading: isLoadingAuthProviders } = useQuery({
    queryKey: ['getAuthProviders'],
    queryFn: async () => {
      return api.methods.getAuthProviders();
    },
  });

  const hasAuthentication = !isLoadingAuthProviders && authProviders.length > 0;

  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [isSigningIn, setIsSigningIn] = React.useState(true);
  const [isSigningOut, setIsSigningOut] = React.useState(true);

  const getCsrfToken = React.useCallback(async () => {
    const csrfResponse = await fetch(AUTH_CSRF_PATH, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const { csrfToken } = await csrfResponse.json();

    return csrfToken;
  }, []);

  const signOut = React.useCallback(async () => {
    try {
      setIsSigningOut(true);

      const csrfToken = await getCsrfToken();

      await fetch(AUTH_SIGNOUT_PATH, {
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
  }, [getCsrfToken]);

  const getSession = React.useCallback(async () => {
    try {
      setIsSigningIn(true);
      const sessionResponse = await fetch(AUTH_SESSION_PATH);
      setSession(await sessionResponse.json());
    } catch (error) {
      console.error((error as Error).message);
      signOut();
    }

    setIsSigningIn(false);
  }, [signOut]);

  const signIn = React.useCallback(
    async (provider: AuthProvider) => {
      try {
        setIsSigningIn(true);

        const csrfToken = await getCsrfToken();

        const signInResponse = await fetch(`${AUTH_SIGNIN_PATH}/${provider}`, {
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
    [getCsrfToken, signOut],
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
    isLoadingAuthProviders,
    hasAuthentication,
  };
}
