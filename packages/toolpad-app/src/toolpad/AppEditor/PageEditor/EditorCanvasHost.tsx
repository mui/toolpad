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

export default React.forwardRef<EditorCanvasHostHandle, EditorCanvasHostProps>(
  function EditorCanvasHost(
    { appId, className, pageNodeId, dom, overlay, onRuntimeEvent },
    forwardedRef,
  ) {
    const frameRef = React.useRef<HTMLIFrameElement>(null);

    const update = React.useCallback(() => {
      const renderDom = appDom.createRenderTree(dom);
      // eslint-disable-next-line no-underscore-dangle
      frameRef.current?.contentWindow?.__TOOLPAD_BRIDGE__?.update({
        appId,
        dom: renderDom,
      });
    }, [appId, dom]);
    React.useEffect(() => update(), [update]);

    const onReady = React.useCallback(() => {
      update();
    }, [update]);

    const onReadyRef = React.useRef(onReady);
    React.useEffect(() => {
      onReadyRef.current = onReady;
    }, [onReady]);

    React.useEffect(() => {
      const frameWindow = frameRef.current?.contentWindow;
      if (!frameWindow) {
        throw new Error('Iframe ref not attached');
      }

      // eslint-disable-next-line no-underscore-dangle
      if (frameWindow.__TOOLPAD_READY__ === true) {
        onReadyRef.current?.();
        // eslint-disable-next-line no-underscore-dangle
      } else if (typeof frameWindow.__TOOLPAD_READY__ !== 'function') {
        // eslint-disable-next-line no-underscore-dangle
        frameWindow.__TOOLPAD_READY__ = () => onReadyRef.current?.();
      }
    }, []);

    const [contentWindow, setContentWindow] = React.useState<Window | null>(null);
    const [editorOverlayRoot, setEditorOverlayRoot] = React.useState<HTMLElement | null>(null);

    const getBridge = React.useCallback((): ToolpadBridge => {
      invariant(
        // eslint-disable-next-line no-underscore-dangle
        frameRef.current?.contentWindow?.__TOOLPAD_BRIDGE__,
        'bridge not initialized yet',
      );
      // eslint-disable-next-line no-underscore-dangle
      return frameRef.current?.contentWindow?.__TOOLPAD_BRIDGE__;
    }, []);

    React.useImperativeHandle(
      forwardedRef,
      () => {
        return {
          getViewCoordinates(clientX, clientY) {
            return getBridge().getViewCoordinates(clientX, clientY);
          },
          getPageViewState() {
            return getBridge().getPageViewState();
          },
        };
      },
      [getBridge],
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
