import * as React from 'react';
import type { ToolpadBridge } from './ToolpadBridge';

export const BridgeContext = React.createContext<ToolpadBridge | null>(null);
