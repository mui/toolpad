import * as React from 'react';
import { Fade, styled } from '@mui/material';
import { NodeHashes } from '@mui/toolpad-core';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import * as ReactDOM from 'react-dom';
import invariant from 'invariant';
import useEventCallback from '@mui/utils/useEventCallback';
import { HashRouter, UNSAFE_LocationContext } from 'react-router-dom';
import { TOOLPAD_BRIDGE_GLOBAL } from '../../../constants';
import { HTML_ID_EDITOR_OVERLAY } from '../../../runtime/constants';
import { LogEntry } from '../../../components/Console';
import { useAppStateApi } from '../../AppState';
import { createCommands, type ToolpadBridge } from '../../../canvas/ToolpadBridge';
import CenteredSpinner from '../../../components/CenteredSpinner';
import { useProject } from '../../../project';
import { RuntimeState } from '../../../runtime';
import { AppHost, AppHostContext } from '../../../runtime/AppHostContext';
import ToolpadApp from '../../../runtime/ToolpadApp';
import { CanvasHooks, CanvasHooksContext } from '../../../runtime/CanvasHooksContext';
import { Emitter } from '@mui/toolpad-utils/events';
import { rectContainsPoint } from '../../../utils/geometry';
import { queryClient } from '../../../runtime/api';
import { PageViewState } from '../../../types';
import { update } from '@mui/toolpad-utils/immutability';
import { updateNodeInfo } from '../../../canvas';
import throttle from 'lodash-es/throttle';

interface OverlayProps {
  children?: React.ReactNode;
  container: HTMLElement;
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

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}

export interface EditorCanvasHostProps {
  className?: string;
  pageName: string;
  runtimeState: RuntimeState;
  savedNodes: NodeHashes;
  onConsoleEntry?: (entry: LogEntry) => void;
  overlay?: React.ReactNode;
  onInit?: (bridge: ToolpadBridge) => void;
  base: string;
}

const CanvasRoot = styled('div')({
  width: '100%',
  position: 'relative',
});

const CanvasOverlay = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  position: 'absolute',
  width: '100%',
  height: '100%',
}));

const CanvasFrame = styled('iframe')({
  border: 'none',
  position: 'absolute',
  width: '100%',
  height: '100%',
});

function useOnChange<T = unknown>(value: T, handler: (newValue: T, oldValue: T) => void) {
  const stableHandler = useEventCallback(handler);
  const prevValue = React.useRef(value);
  React.useEffect(() => {
    if (prevValue.current !== value) {
      stableHandler(value, prevValue.current);
      prevValue.current = value;
    }
  }, [value, stableHandler]);
}

const appHost: AppHost = {
  isPreview: true,
  isCustomServer: false,
  isCanvas: true,
  Router: HashRouter,
};

export default function EditorCanvasHost({
  className,
  pageName,
  runtimeState,
  base,
  savedNodes,
  overlay,
  onConsoleEntry,
  onInit,
}: EditorCanvasHostProps) {
  const project = useProject();
  const appStateApi = useAppStateApi();

  const [bridge, setBridge] = React.useState<ToolpadBridge | null>(null);

  const updateOnBridge = React.useCallback(() => {
    if (bridge) {
      bridge.canvasCommands.update({ ...runtimeState, savedNodes });
    }
  }, [bridge, runtimeState, savedNodes]);

  React.useEffect(() => {
    updateOnBridge();
  }, [updateOnBridge]);

  const onConsoleEntryRef = React.useRef(onConsoleEntry);
  React.useLayoutEffect(() => {
    onConsoleEntryRef.current = onConsoleEntry;
  });

  const [editorOverlayRoot, setEditorOverlayRoot] = React.useState<HTMLElement | null>(null);

  const handleKeyDown = useEventCallback((event: KeyboardEvent) => {
    const isZ = !!event.key && event.key.toLowerCase() === 'z';

    const undoShortcut = isZ && (event.metaKey || event.ctrlKey);
    const redoShortcut = undoShortcut && event.shiftKey;

    if (redoShortcut) {
      event.preventDefault();
      appStateApi.redo();
    } else if (undoShortcut) {
      event.preventDefault();
      appStateApi.undo();
    }
  });

  const src = `${base}/pages/${pageName}`;

  const [loading, setLoading] = React.useState(true);
  useOnChange(src, () => setLoading(true));

  const initBridge = useEventCallback((bridgeInstance: ToolpadBridge) => {
    const handleReady = (readyBridge: ToolpadBridge) => {
      setLoading(false);
      setBridge(readyBridge);
      onInit?.(readyBridge);
    };

    if (bridgeInstance.canvasCommands.isReady()) {
      handleReady(bridgeInstance);
    } else {
      const readyHandler = () => {
        handleReady(bridgeInstance);
        bridgeInstance.canvasEvents.off('ready', readyHandler);
      };
      bridgeInstance.canvasEvents.on('ready', readyHandler);
    }
  });

  const handleFrameLoad = React.useCallback<React.ReactEventHandler<HTMLIFrameElement>>(
    (event) => {
      const iframeWindow = event.currentTarget.contentWindow;
      invariant(iframeWindow, 'Iframe not attached');

      const bridgeInstance = iframeWindow[TOOLPAD_BRIDGE_GLOBAL];

      invariant(
        typeof bridgeInstance !== 'function',
        'Only the host should set the bridge to a handler',
      );
      if (bridgeInstance) {
        initBridge(bridgeInstance);
      } else {
        iframeWindow[TOOLPAD_BRIDGE_GLOBAL] = initBridge;
      }

      iframeWindow.addEventListener('keydown', handleKeyDown);
      iframeWindow.addEventListener('unload', () => {
        iframeWindow.removeEventListener('keydown', handleKeyDown);
      });

      setEditorOverlayRoot(iframeWindow.document.getElementById(HTML_ID_EDITOR_OVERLAY));

      const observer = new MutationObserver(() => {
        setEditorOverlayRoot(iframeWindow.document.getElementById(HTML_ID_EDITOR_OVERLAY));
      });

      observer.observe(iframeWindow.document.body, {
        subtree: true,
        childList: true,
      });

      return () => {
        observer.disconnect();
      };
    },
    [handleKeyDown, initBridge],
  );

  const invalidateCanvasQueries = useEventCallback(() => {
    bridge?.canvasCommands.invalidateQueries();
  });

  React.useEffect(() => {
    return project.events.subscribe('queriesInvalidated', invalidateCanvasQueries);
  }, [project.events, invalidateCanvasQueries]);

  const state = React.useMemo(() => ({ ...runtimeState, savedNodes }), [runtimeState, savedNodes]);

  const [portal, setPortal] = React.useState<HTMLIFrameElement | null>(null);

  const handleIframeLoad = React.useCallback<React.ReactEventHandler<HTMLIFrameElement>>(
    (event) => {
      setPortal(event.currentTarget.contentDocument.getElementById('root'));
    },
    [],
  );

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

  const appRootRef = React.useRef<HTMLDivElement>();
  const appRootCleanupRef = React.useRef<() => void>();
  const onAppRoot = React.useCallback((appRoot: HTMLDivElement) => {
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

    onInit?.(bridge);
  }, []);

  React.useEffect(
    () => () => {
      appRootCleanupRef.current?.();
      appRootCleanupRef.current = undefined;
    },
    [],
  );

  return (
    <CanvasRoot className={className}>
      <CanvasFrame srcDoc={`<!DOCTYPE html><div id="root"></div>`} onLoad={handleIframeLoad} />
      {portal
        ? ReactDOM.createPortal(
            <Overlay container={portal}>
              <CanvasHooksContext.Provider value={canvasHooks}>
                <UNSAFE_LocationContext.Provider value={null}>
                  <AppHostContext.Provider value={appHost}>
                    <ToolpadApp rootRef={onAppRoot} basename="/" state={state} />
                  </AppHostContext.Provider>
                </UNSAFE_LocationContext.Provider>
              </CanvasHooksContext.Provider>
            </Overlay>,
            portal,
          )
        : null}

      {/* <CanvasFrame
        name="data-toolpad-canvas"
        onLoad={handleFrameLoad}
        src={src}
        // Used by the runtime to know when to load react devtools
        data-toolpad-canvas
        /> */}
      {editorOverlayRoot
        ? ReactDOM.createPortal(
            <Overlay container={editorOverlayRoot}>{overlay}</Overlay>,
            editorOverlayRoot,
          )
        : null}

      {/* <Fade in={loading} appear={false} timeout={{ enter: 0, exit: 100 }}>
        <CanvasOverlay>
          <CenteredSpinner />
        </CanvasOverlay>
      </Fade> */}
    </CanvasRoot>
  );
}
