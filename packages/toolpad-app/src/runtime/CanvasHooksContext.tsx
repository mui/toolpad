import { NodeId } from '@mui/toolpad-core';
import * as React from 'react';

export interface NavigateToPage {
  (pageNodeId: NodeId): void;
}

/**
 * Context created by the app canvas to override behavior for the app editor
 */
export interface CanvasHooks {
  savedNodes?: Record<NodeId, boolean>;
  navigateToPage?: NavigateToPage;
}

export const CanvasHooksContext = React.createContext<CanvasHooks>({});
