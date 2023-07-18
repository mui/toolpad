import * as React from 'react';
import invariant from 'invariant';
import { DevRpcServer } from '../shared/types';
import RpcClient from '../shared/RpcClient';
import { ToolpadFile } from '../shared/schemas';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

type ServerContextValue = {
  connectionStatus: ConnectionStatus;
  saveFile: (name: string, file: ToolpadFile) => Promise<void>;
};

export const ServerContext = React.createContext<{
  connectionStatus: ConnectionStatus;
  saveFile: (name: string, file: ToolpadFile) => Promise<void>;
} | null>(null);

interface ServerProviderProps {
  wsUrl: string;
  children?: React.ReactNode;
}

export function ServerProvider({ wsUrl, children }: ServerProviderProps) {
  const [client, setClient] = React.useState<RpcClient<DevRpcServer> | null>(null);
  const [connectionStatus, setConnectionStatus] = React.useState<ConnectionStatus>('connecting');

  React.useEffect(() => {
    const ws = new WebSocket(wsUrl);
    setClient(new RpcClient<DevRpcServer>(ws));

    ws.addEventListener('open', () => {
      setConnectionStatus('connected');
    });

    ws.addEventListener('close', () => {
      setConnectionStatus('disconnected');
    });

    return () => {
      ws.close();
    };
  }, [wsUrl]);

  const context: ServerContextValue = React.useMemo(() => {
    return {
      connectionStatus,
      saveFile(name, file) {
        invariant(client, 'client must be initialized');
        return client.call('saveFile', [name, file]);
      },
    };
  }, [client, connectionStatus]);

  return <ServerContext.Provider value={context}>{children}</ServerContext.Provider>;
}

export function useServer() {
  const server = React.useContext(ServerContext);
  invariant(server, 'useServer must be used inside a ServerProvider');
  return server;
}
