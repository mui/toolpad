import * as React from 'react';
import { ToolpadFile } from '../shared/schemas';

export interface ComponentInfo {
  id: string;
  name: string;
  file: ToolpadFile;
  props: object;
}

export const CurrentComponentContext = React.createContext<ComponentInfo | null>(null);
