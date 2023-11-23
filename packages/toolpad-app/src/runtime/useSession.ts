import * as React from 'react';

const AUTH_API_PATH = '/api/auth';

const AUTH_SESSION_PATH = `${AUTH_API_PATH}/session`;
const AUTH_SIGNOUT_PATH = `${AUTH_API_PATH}/signout`;

export type AuthProvider = 'github' | 'google';
export interface Session {
  user: {
    name: string;
    email: string;
    image: string;
  };
}

export interface SessionPayload {
  session: Session | null;
  signIn: (provider: AuthProvider) => void | Promise<void>;
  signOut: () => void | Promise<void>;
  isLoading: boolean;
}

export const SessionContext = React.createContext<SessionPayload>({
  session: null,
  signIn: () => {},
  signOut: () => {},
  isLoading: false,
});

export function useSession(): SessionPayload {
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const signOut = React.useCallback(async () => {
    try {
      await fetch(AUTH_SIGNOUT_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Auth-Return-Redirect': '1',
        },
      });
    } catch (error) {
      console.error((error as Error).message);
    }

    setSession(null);
  }, []);

  const getSession = React.useCallback(async () => {
    if (!session) {
      try {
        setIsLoading(true);
        const sessionResponse = await fetch(AUTH_SESSION_PATH);
        setSession(await sessionResponse.json());
      } catch (error) {
        console.error((error as Error).message);
        signOut();
      }

      setIsLoading(false);
    }
  }, [session, signOut]);

  const signIn = React.useCallback(
    async (provider: AuthProvider) => {
      try {
        setIsLoading(true);

        const signInResponse = await fetch(`${AUTH_API_PATH}/signin/${provider}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Auth-Return-Redirect': '1',
          },
        });
        const { url: signInUrl } = await signInResponse.json();

        window.location.href = signInUrl;
      } catch (error) {
        console.error((error as Error).message);
        signOut();

        setIsLoading(false);
      }
    },
    [signOut],
  );

  React.useEffect(() => {
    getSession();
  }, [getSession]);

  return {
    session,
    signIn,
    signOut,
    isLoading,
  };
}
