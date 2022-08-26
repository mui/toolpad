import * as React from 'react';
import { fireEvent } from '@mui/toolpad-core/runtime';
import invariant from 'invariant';
import ToolpadApp, { CanvasHooks, CanvasHooksContext } from '../runtime';
import * as appDom from '../appDom';
import { PageViewState } from '../types';
import getPageViewState from './getPageViewState';
import { rectContainsPoint } from '../utils/geometry';

export interface AppCanvasState {
  appId: string;
  dom: appDom.RenderTree;
}

export interface ToolpadBridge {
  update(updates: AppCanvasState): void;
  getViewCoordinates(clientX: number, clientY: number): { x: number; y: number } | null;
  getPageViewState(): PageViewState;
}

declare global {
  interface Window {
    __TOOLPAD_READY__?: boolean | (() => void);
    __TOOLPAD_BRIDGE__?: ToolpadBridge;
  }
}

export interface AppCanvasProps {
  basename: string;
}

export default function AppCanvas({ basename }: AppCanvasProps) {
  const [state, setState] = React.useState<AppCanvasState | null>(null);

  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    window.__TOOLPAD_BRIDGE__ = {
      update: (newState) => {
        React.startTransition(() => {
          setState(newState);
        });
      },
      getPageViewState: () => {
        const appRoot = rootRef.current;
        invariant(appRoot, 'App ref not attached');
        return getPageViewState(appRoot);
      },
      getViewCoordinates(clientX, clientY) {
        const appRoot = rootRef.current;
        if (!appRoot) {
          return null;
        }
        const rect = appRoot.getBoundingClientRect();
        if (rectContainsPoint(rect, clientX, clientY)) {
          return { x: clientX - rect.x, y: clientY - rect.y };
        }
        return null;
      },
    };

    // eslint-disable-next-line no-underscore-dangle
    if (typeof window.__TOOLPAD_READY__ === 'function') {
      // eslint-disable-next-line no-underscore-dangle
      window.__TOOLPAD_READY__();
    } else {
      // eslint-disable-next-line no-underscore-dangle
      window.__TOOLPAD_READY__ = true;
    }
    return () => {
      // eslint-disable-next-line no-underscore-dangle
      delete window.__TOOLPAD_BRIDGE__;
    };
  }, []);

  React.useEffect(() => {
    // Run after every render
    fireEvent({ type: 'afterRender' });
  });

  const editorHooks: CanvasHooks = React.useMemo(() => {
    return {
      navigateToPage(pageNodeId) {
        fireEvent({ type: 'pageNavigationRequest', pageNodeId });
      },
    };
  }, []);

  return state ? (
    <CanvasHooksContext.Provider value={editorHooks}>
      <ToolpadApp
        rootRef={rootRef}
        hidePreviewBanner
        dom={state.dom}
        version="preview"
        appId={state.appId}
        basename={`${basename}/${state.appId}`}
      />
    </CanvasHooksContext.Provider>
  ) : (
    <div>loading...</div>
  );
}
