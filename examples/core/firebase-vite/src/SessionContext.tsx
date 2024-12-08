import * as React from 'react';

export interface Session {
  user: {
    name?: string;
    email?: string;
    image?: string;
  };
}

interface SessionContextType {
  session: Session | null;
  setSession: (session: Session) => void;
  loading: boolean;
}

const SessionContext = React.createContext<SessionContextType>({
  session: null,
  setSession: () => {},
  loading: true,
});

export default SessionContext;

export const useSession = () => React.useContext(SessionContext);
