import * as React from 'react';
import { styled, useEventCallback } from '@mui/material';
import {
  NodeHashes,
  RuntimeEvents,
  CanvasEventsContext,
  AppHostProvider,
  useAppHost,
  queryClient,
  NodeId,
  FlowDirection,
  SlotType,
} from '@toolpad/studio-runtime';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import * as ReactDOM from 'react-dom';
import { Emitter } from '@toolpad/utils/events';
import { update } from '@toolpad/utils/immutability';
import { throttle } from 'lodash-es';
import invariant from 'invariant';
import * as appDom from '@toolpad/studio-runtime/appDom';
import { useProject } from '../../../project';
import { RuntimeState } from '../../../runtime';
import { RenderedPage, ToolpadAppProvider } from '../../../runtime/ToolpadApp';
import { CanvasHooks, CanvasHooksContext } from '../../../runtime/CanvasHooksContext';
import {
  rectContainsPoint,
  getRelativeBoundingRect,
  getRelativeOuterRect,
} from '../../../utils/geometry';
import { PageViewState, NodeInfo, SlotsState } from '../../../types';
import { useAppStateApi } from '../../AppState';
import { FONTS_URL } from '../../../runtime/constants';
import { scrollIntoViewIfNeeded } from '../../../utils/dom';

// Interface to communicate between editor and canvas
export interface ToolpadBridge {
  // Events fired in the canvas, listened in the editor
  canvasEvents: Emitter<RuntimeEvents>;
  // Commands executed from the editor, ran in the canvas
  canvasCommands: {
    getViewCoordinates(clientX: number, clientY: number): { x: number; y: number } | null;
    getPageViewState(): PageViewState;
    scrollComponent(nodeId: string): void;
    isReady(): boolean;
    invalidateQueries(): void;
  };
}

export function updateNodeInfo(nodeInfo: NodeInfo, rootElm: Element): NodeInfo {
  const nodeElm = rootElm.querySelector(`[data-toolpad-node-id="${nodeInfo.nodeId}"]`);

  if (!nodeElm) {
    return nodeInfo;
  }

  const rect = getRelativeOuterRect(rootElm, nodeElm);

  const slotElms = rootElm.querySelectorAll(`[data-toolpad-slot-parent="${nodeInfo.nodeId}"]`);

  const slots: SlotsState = {};

  for (const slotElm of slotElms) {
    const slotName = slotElm.getAttribute('data-toolpad-slot-name');
    const slotType = slotElm.getAttribute('data-toolpad-slot-type');

    invariant(slotName, 'Slot name not found');
    invariant(slotType, 'Slot type not found');

    if (slots[slotName]) {
      continue;
    }

    const slotRect =
      slotType === 'single'
        ? getRelativeBoundingRect(rootElm, slotElm)
        : getRelativeBoundingRect(rootElm, slotElm);

    const display = window.getComputedStyle(slotElm).display;
    let flowDirection: FlowDirection = 'row';
    if (slotType === 'layout') {
      flowDirection = 'column';
    } else if (display === 'grid') {
      const gridAutoFlow = window.getComputedStyle(slotElm).gridAutoFlow;
      flowDirection = gridAutoFlow === 'row' ? 'column' : 'row';
    } else if (display === 'flex') {
      flowDirection = window.getComputedStyle(slotElm).flexDirection as FlowDirection;
    }

    slots[slotName] = {
      type: slotType as SlotType,
      rect: slotRect,
      flowDirection,
    };
  }

  return { ...nodeInfo, rect, slots };
}

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
        canvasEvents: new Emitter(),
        canvasCommands: {
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
          scrollComponent: (nodeId: NodeId) => {
            if (!appRoot) {
              return;
            }
            const node = appRoot.querySelector(`[data-node-id='${nodeId}']`);

            if (node) {
              scrollIntoViewIfNeeded(node, { behavior: 'instant', block: 'center', inline: 'end' });
            }
          },
        },
      };

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

  const appHost = useAppHost();

  return (
    <CanvasRoot className={className}>
      <CanvasFrame
        name="data-toolpad-canvas"
        srcDoc={`
          <!doctype html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <title>Toolpad</title>
              <link rel="preload" href="${FONTS_URL}" as="style" onload="this.onload=null;this.rel='stylesheet'">
              <noscript><link rel="stylesheet" href="${FONTS_URL}"></noscript>
              <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
              />
            </head>
            <body className="notranslate">
              <div id="root"></div>
            </body>
          </html>
        `}
        onLoad={handleIframeLoad}
      />
      {page && portal
        ? ReactDOM.createPortal(
            <Overlay container={portal}>
              <CanvasHooksContext.Provider value={canvasHooks}>
                <CanvasEventsContext.Provider value={canvasEvents}>
                  <AppHostProvider {...appHost} isCanvas isPreview>
                    <ToolpadAppProvider rootRef={onAppRoot} basename={base} state={runtimeState}>
                      <RenderedPage page={page} />
                    </ToolpadAppProvider>
                  </AppHostProvider>
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
