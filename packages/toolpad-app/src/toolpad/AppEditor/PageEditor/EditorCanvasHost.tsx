import * as React from 'react';
import { Box, CircularProgress, styled } from '@mui/material';
import { NodeId, RuntimeEvent } from '@mui/toolpad-core';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import ReactDOM from 'react-dom';
import { setEventHandler } from '@mui/toolpad-core/runtime';
import invariant from 'invariant';
import * as appDom from '../../../appDom';
import { HTML_ID_EDITOR_OVERLAY } from '../../../constants';
import { PageViewState } from '../../../types';
import { ToolpadBridge } from '../../../canvas';
import useEvent from '../../../utils/useEvent';
import { LogEntry } from '../../../components/Console';

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

export interface EditorCanvasHostHandle {
  getViewCoordinates(clientX: number, clientY: number): { x: number; y: number } | null;
  getPageViewState(): PageViewState;
}

export interface EditorCanvasHostProps {
  className?: string;
  appId: string;
  pageNodeId: NodeId;
  dom: appDom.AppDom;
  onRuntimeEvent?: (event: RuntimeEvent) => void;
  onConsoleEntry?: (entry: LogEntry) => void;
  overlay?: React.ReactNode;
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

function wrapConsoleMethod<A extends any[]>(
  level: string,
  method: (...args: A) => void,
  onEntry: (entry: LogEntry) => void,
): (...args: A) => void {
  return new Proxy(method, {
    apply(target, thisArg, args: A) {
      onEntry({ level, timestamp: Date.now(), args });
      return target.apply(thisArg, args);
    },
  });
}

function wrapConsole(targetConsole: Console, onEntry: (entry: LogEntry) => void): Console {
  const wrapped = new Map<PropertyKey, any>([
    ['log', wrapConsoleMethod('log', targetConsole.log, onEntry)],
    ['info', wrapConsoleMethod('info', targetConsole.info, onEntry)],
    ['warn', wrapConsoleMethod('warn', targetConsole.warn, onEntry)],
    ['error', wrapConsoleMethod('error', targetConsole.error, onEntry)],
    ['debug', wrapConsoleMethod('debug', targetConsole.debug, onEntry)],
  ]);
  return new Proxy(targetConsole, {
    get(target, property, receiver) {
      return wrapped.get(property) || Reflect.get(target, property, receiver);
    },
  });
}

export default React.forwardRef<EditorCanvasHostHandle, EditorCanvasHostProps>(
  function EditorCanvasHost(
    { appId, className, pageNodeId, dom, overlay, onRuntimeEvent, onConsoleEntry },
    forwardedRef,
  ) {
    const frameRef = React.useRef<HTMLIFrameElement>(null);

    const [bridge, setBridge] = React.useState<ToolpadBridge | null>(null);

    const update = React.useCallback(() => {
      if (bridge) {
        const renderDom = appDom.createRenderTree(dom);
        bridge.update({ appId, dom: renderDom });
      }
    }, [appId, dom, bridge]);

    React.useEffect(() => update(), [update]);

    const handleInit = useEvent((newBridge: ToolpadBridge) => {
      setBridge(newBridge);
      const renderDom = appDom.createRenderTree(dom);
      newBridge.update({ appId, dom: renderDom });
    });

    const onConsoleEntryRef = React.useRef(onConsoleEntry);
    React.useLayoutEffect(() => {
      onConsoleEntryRef.current = onConsoleEntry;
    });

    React.useEffect(() => {
      const frameWindow = frameRef.current?.contentWindow as
        | (Window & typeof globalThis)
        | undefined
        | null;
      invariant(frameWindow, 'Iframe ref not attached');

      const originalConsole: Console = frameWindow.console;
      frameWindow.console = wrapConsole(originalConsole, (entry: LogEntry) =>
        onConsoleEntryRef.current?.(entry),
      );

      // eslint-disable-next-line no-underscore-dangle
      if (typeof frameWindow.__TOOLPAD_BRIDGE__ === 'object') {
        // eslint-disable-next-line no-underscore-dangle
        handleInit(frameWindow.__TOOLPAD_BRIDGE__);
        // eslint-disable-next-line no-underscore-dangle
      } else if (typeof frameWindow.__TOOLPAD_BRIDGE__ === 'undefined') {
        // eslint-disable-next-line no-underscore-dangle
        frameWindow.__TOOLPAD_BRIDGE__ = (newBridge: ToolpadBridge) => {
          handleInit(newBridge);
        };
      }

      return () => {
        frameWindow.console = originalConsole;
      };
    }, [handleInit]);

    const [contentWindow, setContentWindow] = React.useState<Window | null>(null);
    const [editorOverlayRoot, setEditorOverlayRoot] = React.useState<HTMLElement | null>(null);

    React.useImperativeHandle(
      forwardedRef,
      () => {
        return {
          getViewCoordinates(clientX, clientY) {
            invariant(bridge, 'bridge not initialized');
            return bridge.getViewCoordinates(clientX, clientY);
          },
          getPageViewState() {
            invariant(bridge, 'bridge not initialized');
            return bridge.getPageViewState();
          },
        };
      },
      [bridge],
    );

    const handleRuntimeEventRef = React.useRef(onRuntimeEvent);
    React.useEffect(() => {
      handleRuntimeEventRef.current = onRuntimeEvent;
    }, [onRuntimeEvent]);

    const handleFrameLoad = React.useCallback(() => {
      setContentWindow(frameRef.current?.contentWindow || null);
    }, []);

    React.useEffect(() => {
      if (!contentWindow) {
        return () => {};
      }

      const observer = new MutationObserver(() => {
        setEditorOverlayRoot(contentWindow.document.getElementById(HTML_ID_EDITOR_OVERLAY));
      });

      observer.observe(contentWindow.document.body, {
        subtree: true,
        childList: true,
      });

      const cleanupHandler = setEventHandler(contentWindow, (event) =>
        handleRuntimeEventRef.current?.(event),
      );

      return () => {
        observer.disconnect();
        cleanupHandler();
      };
    }, [contentWindow]);

    return (
      <CanvasRoot className={className}>
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
        <CanvasFrame
          ref={frameRef}
          onLoad={handleFrameLoad}
          src={`/app-canvas/${appId}/pages/${pageNodeId}`}
          // Used by the runtime to know when to load react devtools
          data-toolpad-canvas
        />
        {editorOverlayRoot
          ? ReactDOM.createPortal(
              <Overlay container={editorOverlayRoot}>{overlay}</Overlay>,
              editorOverlayRoot,
            )
          : null}
      </CanvasRoot>
    );
  },
);
