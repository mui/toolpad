import { ToolpadFile } from './schemas';

export interface WithDevtoolParams {
  name: string;
  file: ToolpadFile;
  wsUrl: string;
}

export type DevRpcServer = {
  methods: {
    saveFile: (name: string, file: ToolpadFile) => Promise<void>;
  };
};
