import { NodeId } from '@mui/toolpad-core';
import * as React from 'react';
import { NodeHashes } from '../types';

export interface NavigateToPage {
  (pageNodeId: NodeId, pageParameters?: Record<string, string>): void;
}

/**
 * Context created by the app canvas to override behavior for the app editor
 */
export interface CanvasHooks {
  savedNodes?: NodeHashes;
  navigateToPage?: NavigateToPage;
}

export const CanvasHooksContext = React.createContext<CanvasHooks>({});
