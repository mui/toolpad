import { ComponentConfig, NodeHashes } from '@mui/toolpad-core';
import * as React from 'react';
import * as appDom from '@mui/toolpad-core/appDom';

export interface NavigateToPage {
  (name: string, pageParameters?: Record<string, string>): void;
}

/**
 * Context created by the app canvas to override behavior for the app editor
 */
export interface CanvasHooks {
  savedNodes?: NodeHashes;
  registerNode?: (
    node: appDom.AppDomNode,
    props: Record<string, unknown>,
    componentConfig: ComponentConfig,
    elm: Element | undefined,
  ) => () => void;
  overlayRef?: (elm: HTMLDivElement) => void;
}

export const CanvasHooksContext = React.createContext<CanvasHooks>({});
