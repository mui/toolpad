import { NodeHashes, NodeId } from '@mui/toolpad-core';
import * as React from 'react';

export interface NavigateToPage {
  (pageNodeId: NodeId, pageParameters?: Record<string, string>): void;
}

/**
 * Context created by the app canvas to override behavior for the app editor
 */
export interface CanvasHooks {
  savedNodes?: NodeHashes;
}

export const CanvasHooksContext = React.createContext<CanvasHooks>({});
