import * as React from 'react';
import invariant from 'invariant';
import { Emitter } from '@mui/toolpad-utils/events';
import { Backend, ConnectionStatus, DevRpcMethods } from '../shared/types';
import RpcClient from '../shared/RpcClient';
import { ToolpadFile } from '../shared/schemas';

export class CliBackend extends Emitter<{ connectionStatusChange: null }> implements Backend {
  private ws: WebSocket;

  private rpcClient: RpcClient<DevRpcMethods>;

  private connectionStatus: ConnectionStatus = 'connecting';

  constructor(wsUrl: string) {
    super();
    this.ws = new WebSocket(wsUrl);

    this.ws.addEventListener('open', () => {
      this.connectionStatus = 'connected';
      this.emit('connectionStatusChange', null);
    });
    this.ws.addEventListener('close', () => {
      this.connectionStatus = 'disconnected';
      this.emit('connectionStatusChange', null);
    });

    this.rpcClient = new RpcClient<DevRpcMethods>(this.ws);
  }

  getConnectionStatus() {
    return this.connectionStatus;
  }

  async saveFile(name: string, file: ToolpadFile) {
    return this.rpcClient.call('saveFile', [name, file]);
  }
}

export class NoopBackend extends Emitter<{ connectionStatusChange: null }> implements Backend {
  // eslint-disable-next-line class-methods-use-this
  getConnectionStatus(): ConnectionStatus {
    return 'connected';
  }

  // eslint-disable-next-line class-methods-use-this
  async saveFile() {
    throw new Error('Not implemented');
  }
}

export const BackendContext = React.createContext<Backend | null>(null);

export interface ServerProviderProps {
  backend: Backend;
  children?: React.ReactNode;
}

export function BackendProvider({ backend, children }: ServerProviderProps) {
  return <BackendContext.Provider value={backend}>{children}</BackendContext.Provider>;
}

export function useBacked() {
  const server = React.useContext(BackendContext);
  invariant(server, 'useBackend must be used inside a BackendProvider');
  return server;
}
