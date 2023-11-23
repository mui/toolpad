import * as React from 'react';

const AUTH_SESSION_PATH = '/api/auth/session';
const AUTH_SIGNOUT_PATH = '/api/auth/signout';

export interface Session {
  user: {
    name: string;
    email: string;
    image: string;
  };
}

export interface SessionPayload {
  session: Session | null;
  signIn: () => void | Promise<void>;
  signOut: () => void | Promise<void>;
}

export const SessionContext = React.createContext<SessionPayload>({
  session: null,
  signIn: () => {},
  signOut: () => {},
});

export function useSession(): SessionPayload {
  const [session, setSession] = React.useState<Session | null>(null);

  const signOut = React.useCallback(async () => {
    try {
      await fetch(AUTH_SIGNOUT_PATH, {
        method: 'POST',
      });
    } catch (error) {
      console.error((error as Error).message);
    }
    setSession(null);
  }, []);

  const signIn = React.useCallback(async () => {
    if (!session) {
      try {
        const sessionResponse = await fetch(AUTH_SESSION_PATH);
        setSession(await sessionResponse.json());
      } catch (error) {
        console.error((error as Error).message);
        signOut();
      }
    }
  }, [session, signOut]);

  React.useEffect(() => {
    signIn();
  }, [session, signIn]);

  return {
    session,
    signIn,
    signOut,
  };
}
