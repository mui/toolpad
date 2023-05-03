import * as React from 'react';
import invariant from 'invariant';
import { throttle } from 'lodash-es';
import { CanvasEventsContext } from '@mui/toolpad-core/runtime';
import ToolpadApp, { LoadComponents } from '../runtime';
import { NodeHashes, RuntimeState } from '../types';
import getPageViewState from './getPageViewState';
import { rectContainsPoint } from '../utils/geometry';
import { CanvasHooks, CanvasHooksContext } from '../runtime/CanvasHooksContext';
import { bridge, setCommandHandler } from './ToolpadBridge';
import { BridgeContext } from './BridgeContext';

export interface AppCanvasState extends RuntimeState {
  savedNodes: NodeHashes;
}

const handleScreenUpdate = throttle(
  () => {
    bridge.canvasEvents.emit('screenUpdate', {});
  },
  50,
  { trailing: true },
);

export interface AppCanvasProps {
  initialState?: AppCanvasState | null;
  basename: string;
  loadComponents: LoadComponents;
}

export default function AppCanvas({
  loadComponents,
  basename,
  initialState = null,
}: AppCanvasProps) {
  const [state, setState] = React.useState<AppCanvasState | null>(initialState);

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
    const unsetGetPageViewState = setCommandHandler(
      bridge.canvasCommands,
      'getPageViewState',
      () => {
        invariant(appRootRef.current, 'App ref not attached');
        return getPageViewState(appRootRef.current);
      },
    );

    const unsetGetViewCoordinates = setCommandHandler(
      bridge.canvasCommands,
      'getViewCoordinates',
      (clientX, clientY) => {
        if (!appRootRef.current) {
          return null;
        }
        const rect = appRootRef.current.getBoundingClientRect();
        if (rectContainsPoint(rect, clientX, clientY)) {
          return { x: clientX - rect.x, y: clientY - rect.y };
        }
        return null;
      },
    );

    const unsetUpdate = setCommandHandler(bridge.canvasCommands, 'update', (newState) => {
      React.startTransition(() => setState(newState));
    });

    bridge.canvasEvents.emit('ready', {});

    return () => {
      unsetGetPageViewState();
      unsetGetViewCoordinates();
      unsetUpdate();
    };
  }, []);

  const savedNodes = state?.savedNodes;
  const editorHooks: CanvasHooks = React.useMemo(() => {
    return {
      savedNodes,
      navigateToPage(pageNodeId) {
        bridge.canvasEvents.emit('pageNavigationRequest', { pageNodeId });
      },
    };
  }, [savedNodes]);

  return state ? (
    <BridgeContext.Provider value={bridge}>
      <CanvasHooksContext.Provider value={editorHooks}>
        <CanvasEventsContext.Provider value={bridge.canvasEvents}>
          <ToolpadApp
            rootRef={onAppRoot}
            loadComponents={loadComponents}
            hasShell={false}
            basename={basename}
            state={state}
          />
        </CanvasEventsContext.Provider>
      </CanvasHooksContext.Provider>
    </BridgeContext.Provider>
  ) : null;
}
