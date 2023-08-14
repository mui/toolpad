import * as React from 'react';
import invariant from 'invariant';
import { Emitter } from '@mui/toolpad-utils/events';
import { BackendClient, ConnectionStatus, DevRpcMethods } from '../shared/types';
import RpcClient, { RpcClientPort } from '../shared/RpcClient';
import { ToolpadFile } from '../shared/schemas';

export class NoopBackendClient
  extends Emitter<{ connectionStatusChange: null }>
  implements BackendClient
{
  // eslint-disable-next-line class-methods-use-this
  getConnectionStatus(): ConnectionStatus {
    return 'connected';
  }

  // eslint-disable-next-line class-methods-use-this
  async saveFile() {
    throw new Error('Not implemented');
  }
}

export class CliBackendClient
  extends Emitter<{ connectionStatusChange: null }>
  implements BackendClient
{
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

    const wsPort: RpcClientPort = {
      addEventListener: this.ws.addEventListener.bind(this.ws),
      postMessage: this.ws.send.bind(this.ws),
    };

    this.rpcClient = new RpcClient<DevRpcMethods>(wsPort);
  }

  getConnectionStatus() {
    return this.connectionStatus;
  }

  async saveFile(name: string, file: ToolpadFile) {
    return this.rpcClient.call('saveFile', [name, file]);
  }
}

export class BrowserBackendClient
  extends Emitter<{ connectionStatusChange: null }>
  implements BackendClient
{
  private rpcClient: RpcClient<DevRpcMethods>;

  constructor(port: RpcClientPort) {
    super();

    this.rpcClient = new RpcClient<DevRpcMethods>(port);
  }

  // eslint-disable-next-line class-methods-use-this
  getConnectionStatus(): ConnectionStatus {
    return 'connected';
  }

  async saveFile(name: string, file: ToolpadFile) {
    return this.rpcClient.call('saveFile', [name, file]);
  }
}

export const BackendContext = React.createContext<BackendClient | null>(null);

export interface ServerProviderProps {
  backend: BackendClient;
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
