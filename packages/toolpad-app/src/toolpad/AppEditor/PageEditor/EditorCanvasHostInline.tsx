import * as React from 'react';
import { styled, useEventCallback } from '@mui/material';
import { NodeHashes, RuntimeEvents } from '@mui/toolpad-core';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import * as ReactDOM from 'react-dom';
import { Emitter } from '@mui/toolpad-utils/events';
import { update } from '@mui/toolpad-utils/immutability';
import { throttle } from 'lodash-es';
import invariant from 'invariant';
import * as appDom from '@mui/toolpad-core/appDom';
import { CanvasEventsContext } from '@mui/toolpad-core/runtime';
import { createCommands, type ToolpadBridge } from '../../../canvas/ToolpadBridge';
import { useProject } from '../../../project';
import { RuntimeState } from '../../../runtime';
import { AppHost, AppHostContext } from '../../../runtime/AppHostContext';
import { RenderedPage, ToolpadAppProvider } from '../../../runtime/ToolpadApp';
import { CanvasHooks, CanvasHooksContext } from '../../../runtime/CanvasHooksContext';
import { rectContainsPoint } from '../../../utils/geometry';
import { queryClient } from '../../../runtime/api';
import { PageViewState } from '../../../types';
import { updateNodeInfo } from '../../../canvas';
import { useAppStateApi } from '../../AppState';

interface OverlayProps {
  children?: React.ReactNode;
  container?: HTMLElement;
}

function Overlay(props: OverlayProps) {
  const { children, container } = props;

  const cache = React.useMemo(
    () =>
      createCache({
        key: `toolpad-editor-overlay`,
        prepend: true,
        container,
      }),
    [container],
  );

  // See https://github.com/emotion-js/emotion/issues/1105#issuecomment-1058225197
  cache.compat = true;

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}

export interface EditorCanvasHostProps {
  className?: string;
  pageName: string;
  runtimeState: RuntimeState;
  savedNodes: NodeHashes;
  overlay?: React.ReactNode;
  onInit?: (bridge: ToolpadBridge) => void;
  base: string;
}

const CanvasRoot = styled('div')({
  width: '100%',
  position: 'relative',
});

const CanvasFrame = styled('iframe')({
  border: 'none',
  position: 'absolute',
  width: '100%',
  height: '100%',
});

const appHost: AppHost = {
  isPreview: true,
  isCustomServer: false,
  isCanvas: true,
};

export default function EditorCanvasHost({
  pageName,
  className,
  runtimeState,
  base,
  savedNodes,
  overlay,
  onInit,
}: EditorCanvasHostProps) {
  const project = useProject();

  const [canvasEvents, setCanvasEvents] = React.useState<Emitter<RuntimeEvents> | null>(null);

  const [editorOverlayRoot, setEditorOverlayRoot] = React.useState<HTMLElement | null>(null);

  const [portal, setPortal] = React.useState<HTMLElement | null>(null);

  const appStateApi = useAppStateApi();

  const handleIframeLoad = useEventCallback<React.ReactEventHandler<HTMLIFrameElement>>((event) => {
    invariant(event.currentTarget.contentDocument, 'iframe contentDocument is not available');
    const root = event.currentTarget.contentDocument.getElementById('root');
    invariant(root, 'root element not found');

    const iframeWindow = event.currentTarget.contentWindow;
    invariant(iframeWindow, 'Iframe not attached');

    const handleKeyDown = (keyDownEvent: KeyboardEvent) => {
      const isZ = !!keyDownEvent.key && keyDownEvent.key.toLowerCase() === 'z';

      const undoShortcut = isZ && (keyDownEvent.metaKey || keyDownEvent.ctrlKey);
      const redoShortcut = undoShortcut && keyDownEvent.shiftKey;

      if (redoShortcut) {
        keyDownEvent.preventDefault();
        appStateApi.redo();
      } else if (undoShortcut) {
        keyDownEvent.preventDefault();
        appStateApi.undo();
      }
    };

    iframeWindow.addEventListener('keydown', handleKeyDown);
    iframeWindow.addEventListener('unload', () => {
      iframeWindow.removeEventListener('keydown', handleKeyDown);
    });

    setPortal(root);
  });

  const viewState = React.useRef<PageViewState>({ nodes: {} });

  const canvasHooks: CanvasHooks = React.useMemo(
    () => ({
      overlayRef: setEditorOverlayRoot,
      savedNodes,
      registerNode: (node, props, componentConfig) => {
        viewState.current.nodes[node.id] = {
          nodeId: node.id,
          props,
          componentConfig,
        };

        return () => {
          delete viewState.current.nodes[node.id];
        };
      },
    }),
    [savedNodes],
  );

  const appRootCleanupRef = React.useRef<() => void>();
  const projectEventSubscriptionRef = React.useRef<() => void>();
  const onAppRoot = React.useCallback(
    (appRoot: HTMLDivElement) => {
      appRootCleanupRef.current?.();
      appRootCleanupRef.current = undefined;

      if (!appRoot) {
        return;
      }

      const bridge: ToolpadBridge = {
        editorEvents: new Emitter(),
        editorCommands: createCommands(),
        canvasEvents: new Emitter(),
        canvasCommands: createCommands({
          isReady: () => true,
          getPageViewState: () => {
            let nodes = viewState.current.nodes;

            for (const [nodeId, nodeInfo] of Object.entries(nodes)) {
              nodes = update(nodes, {
                [nodeId]: updateNodeInfo(nodeInfo, appRoot),
              });
            }

            return { nodes };
          },
          getViewCoordinates: (clientX: number, clientY: number) => {
            const rect = appRoot.getBoundingClientRect();
            if (rectContainsPoint(rect, clientX, clientY)) {
              return { x: clientX - rect.x, y: clientY - rect.y };
            }
            return null;
          },
          invalidateQueries: () => {
            queryClient.invalidateQueries();
          },
          update: () => {},
        }),
      } satisfies ToolpadBridge;

      const handleScreenUpdate = throttle(
        () => {
          bridge?.canvasEvents.emit('screenUpdate', {});
        },
        50,
        { trailing: true },
      );

      projectEventSubscriptionRef.current = project.events.subscribe('queriesInvalidated', () => {
        queryClient.invalidateQueries();
      });

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

      onInit?.(bridge);
      setCanvasEvents(bridge.canvasEvents);
    },
    [onInit, project.events],
  );

  React.useEffect(
    () => () => {
      appRootCleanupRef.current?.();
      appRootCleanupRef.current = undefined;
      projectEventSubscriptionRef.current?.();
      projectEventSubscriptionRef.current = undefined;
    },
    [],
  );

  const page = appDom.getPageByName(runtimeState.dom, pageName);

  return (
    <CanvasRoot className={className}>
      <CanvasFrame
        name="data-toolpad-canvas"
        srcDoc={`<!DOCTYPE html><div id="root"></div>`}
        onLoad={handleIframeLoad}
      />
      {page && portal
        ? ReactDOM.createPortal(
            <Overlay container={portal}>
              <CanvasHooksContext.Provider value={canvasHooks}>
                <CanvasEventsContext.Provider value={canvasEvents}>
                  <AppHostContext.Provider value={appHost}>
                    <ToolpadAppProvider rootRef={onAppRoot} basename={base} state={runtimeState}>
                      <RenderedPage page={page} />
                    </ToolpadAppProvider>
                  </AppHostContext.Provider>
                </CanvasEventsContext.Provider>
              </CanvasHooksContext.Provider>
            </Overlay>,
            portal,
          )
        : null}
      {editorOverlayRoot
        ? ReactDOM.createPortal(
            <Overlay container={editorOverlayRoot}>{overlay}</Overlay>,
            editorOverlayRoot,
          )
        : null}
    </CanvasRoot>
  );
}
