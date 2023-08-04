import { ToolpadFile } from './schemas';

export interface WithDevtoolParams {
  name: string;
  file: ToolpadFile;
  wsUrl: string;
  dependencies: [string, () => Promise<unknown>][];
}

export type DevRpcMethods = {
  saveFile: (name: string, file: ToolpadFile) => Promise<void>;
};
