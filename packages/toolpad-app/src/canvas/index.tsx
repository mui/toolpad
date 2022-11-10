import * as React from 'react';
import { fireEvent, setEventHandler } from '@mui/toolpad-core/runtime';
import invariant from 'invariant';
import { throttle } from 'lodash-es';
import { RuntimeEvent } from '@mui/toolpad-core';
import ToolpadApp from '../runtime';
import { NodeHashes, PageViewState, RuntimeData } from '../types';
import getPageViewState from './getPageViewState';
import { rectContainsPoint } from '../utils/geometry';
import { CanvasHooks, CanvasHooksContext } from '../runtime/CanvasHooksContext';

export interface AppCanvasState extends RuntimeData {
  savedNodes: NodeHashes;
}

export interface ToolpadBridge {
  onRuntimeEvent(handler: (event: RuntimeEvent) => void): void;
  update(updates: AppCanvasState): void;
  getViewCoordinates(clientX: number, clientY: number): { x: number; y: number } | null;
  getPageViewState(): PageViewState;
}

declare global {
  interface Window {
    __TOOLPAD_BRIDGE__?: ToolpadBridge | ((bridge: ToolpadBridge) => void);
  }
}

const handleScreenUpdate = throttle(() => fireEvent({ type: 'screenUpdate' }), 50, {
  trailing: true,
});

export interface AppCanvasProps {
  basename: string;
}

export default function AppCanvas({ basename }: AppCanvasProps) {
  const [state, setState] = React.useState<AppCanvasState | null>(null);

  const appRootRef = React.useRef<HTMLDivElement>();
  const appRootCleanupRef = React.useRef<() => void>();
  const onAppRoot = React.useCallback((appRoot: HTMLDivElement) => {
    appRootCleanupRef.current?.();
    appRootCleanupRef.current = undefined;

    if (!appRoot) {
      return;
    }

    appRootRef.current = appRoot;

    const mutationObserver = new MutationObserver(handleScreenUpdate);

    mutationObserver.observe(appRoot, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });

    const resizeObserver = new ResizeObserver(handleScreenUpdate);

    resizeObserver.observe(appRoot);
    appRoot.querySelectorAll('*').forEach((elm) => resizeObserver.observe(elm));

    appRootCleanupRef.current = () => {
      handleScreenUpdate.cancel();
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  React.useEffect(
    () => () => {
      appRootCleanupRef.current?.();
      appRootCleanupRef.current = undefined;
    },
    [],
  );

  // Notify host after every render
  React.useEffect(() => {
    if (appRootRef.current) {
      // Only notify screen updates if the approot is rendered
      handleScreenUpdate();
    }
  });

  React.useEffect(() => {
    const bridge: ToolpadBridge = {
      onRuntimeEvent: (handler) => setEventHandler(window, handler),
      update: (newState) => React.startTransition(() => setState(newState)),
      getPageViewState: () => {
        invariant(appRootRef.current, 'App ref not attached');
        return getPageViewState(appRootRef.current);
      },
      getViewCoordinates(clientX, clientY) {
        if (!appRootRef.current) {
          return null;
        }
        const rect = appRootRef.current.getBoundingClientRect();
        if (rectContainsPoint(rect, clientX, clientY)) {
          return { x: clientX - rect.x, y: clientY - rect.y };
        }
        return null;
      },
    };

    // eslint-disable-next-line no-underscore-dangle
    if (typeof window.__TOOLPAD_BRIDGE__ === 'function') {
      // eslint-disable-next-line no-underscore-dangle
      window.__TOOLPAD_BRIDGE__(bridge);
    } else {
      // eslint-disable-next-line no-underscore-dangle
      window.__TOOLPAD_BRIDGE__ = bridge;
    }

    return () => {};
  }, []);

  const savedNodes = state?.savedNodes;
  const editorHooks: CanvasHooks = React.useMemo(() => {
    return {
      savedNodes,
      navigateToPage(pageNodeId) {
        fireEvent({ type: 'pageNavigationRequest', pageNodeId });
      },
    };
  }, [savedNodes]);

  return state ? (
    <CanvasHooksContext.Provider value={editorHooks}>
      <ToolpadApp
        rootRef={onAppRoot}
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
