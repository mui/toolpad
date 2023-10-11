import * as React from 'react';
import invariant from 'invariant';
import { throttle } from 'lodash-es';
import { CanvasEventsContext } from '@mui/toolpad-core/runtime';
import { ToolpadComponents } from '@mui/toolpad-core';
import ToolpadApp from '../runtime/ToolpadApp';
import { queryClient } from '../runtime/api';
import { AppCanvasState } from '../types';
import getPageViewState from './getPageViewState';
import { rectContainsPoint } from '../utils/geometry';
import { CanvasHooks, CanvasHooksContext } from '../runtime/CanvasHooksContext';
import { bridge, setCommandHandler } from './ToolpadBridge';

const handleScreenUpdate = throttle(
  () => {
    bridge?.canvasEvents.emit('screenUpdate', {});
  },
  50,
  { trailing: true },
);

export interface AppCanvasProps {
  state: AppCanvasState;
  basename: string;
  extraComponents: ToolpadComponents;
}

export default function AppCanvas({
  extraComponents,
  basename,
  state: initialState,
}: AppCanvasProps) {
  const [state, setState] = React.useState<AppCanvasState>(initialState);

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
    if (!bridge) {
      return;
    }

    setCommandHandler(bridge.canvasCommands, 'getPageViewState', () => {
      invariant(appRootRef.current, 'App ref not attached');
      return getPageViewState(appRootRef.current);
    });

    setCommandHandler(bridge.canvasCommands, 'getViewCoordinates', (clientX, clientY) => {
      if (!appRootRef.current) {
        return null;
      }
      const rect = appRootRef.current.getBoundingClientRect();
      if (rectContainsPoint(rect, clientX, clientY)) {
        return { x: clientX - rect.x, y: clientY - rect.y };
      }
      return null;
    });

    setCommandHandler(bridge.canvasCommands, 'update', (newState) => {
      // `update` will be called from the parent window. Since the canvas runs in an iframe, it's
      // running in another javascript realm than the one this object was constructed in. This makes
      // the MUI core `deepMerge` function fail. The `deepMerge` function uses `isPlainObject` which checks
      // whether the object constructor property is the global `Object`.
      // See https://github.com/mui/material-ui/blob/b935d3e8f48b5d54f6cd08154fe2f7aa035ab576/packages/mui-utils/src/deepmerge.ts#L2.
      // Since different realms have different globals, this function erroneously marks it as not being a plain object.
      // For now we've use structuredClone to make the `update` method behave as if it was built using
      // `window.postMessage`, which we should probably move towards anyways at some point. structuredClone
      // clones the object as if it was passed using `postMessage` and corrects the `constructor` property.
      React.startTransition(() => setState(structuredClone(newState)));
    });

    setCommandHandler(bridge.canvasCommands, 'invalidateQueries', () => {
      queryClient.invalidateQueries();
    });

    bridge.canvasEvents.emit('ready', {});
  }, []);

  const savedNodes = state?.savedNodes;
  const editorHooks: CanvasHooks = React.useMemo(() => {
    return {
      savedNodes,
    };
  }, [savedNodes]);

  return (
    <CanvasHooksContext.Provider value={editorHooks}>
      <CanvasEventsContext.Provider value={bridge?.canvasEvents || null}>
        <ToolpadApp
          rootRef={onAppRoot}
          extraComponents={extraComponents}
          basename={basename}
          state={state}
        />
      </CanvasEventsContext.Provider>
    </CanvasHooksContext.Provider>
  );
}
