import { ToolpadFile } from './schemas';

export interface WithDevtoolParams {
  readonly filePath: string;
  readonly file: ToolpadFile;
  readonly dependencies: readonly [string, () => Promise<unknown>][];
  readonly wsUrl: string;
}

export type DevRpcMethods = {
  saveFile: (name: string, file: ToolpadFile) => Promise<void>;
};

export interface Config {
  readonly rootDir: string;
  readonly outDir: string;
}
