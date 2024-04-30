import { ComponentConfig, NodeHashes } from '@toolpad/studio-runtime';
import * as React from 'react';
import * as appDom from '@toolpad/studio-runtime/appDom';

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
