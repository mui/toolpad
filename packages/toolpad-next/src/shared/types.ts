import { ToolpadFile } from './schemas';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export interface BackendClient {
  subscribe: (event: 'connectionStatusChange', callback: () => void) => () => void;
  getConnectionStatus: () => ConnectionStatus;
  saveFile: (name: string, file: ToolpadFile) => Promise<void>;
}

export interface WithDevtoolParams {
  readonly filePath: string;
  readonly file: ToolpadFile;
  readonly dependencies: readonly [string, () => Promise<unknown>][];
  readonly backend: BackendClient;
}

export type DevRpcMethods = {
  saveFile: (name: string, file: ToolpadFile) => Promise<void>;
};

export interface Config {
  readonly rootDir: string;
  readonly outDir: string;
}
