import * as React from 'react';
import { Box, CircularProgress, styled } from '@mui/material';
import { NodeId } from '@mui/toolpad-core';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import ReactDOM from 'react-dom';
import * as appDom from '../../../appDom';
import { HTML_ID_APP_ROOT, HTML_ID_EDITOR_OVERLAY } from '../../../constants';
import { rectContainsPoint } from '../../../utils/geometry';

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
  getRootElm(): HTMLElement | null;
  getViewCoordinates(clientX: number, clientY: number): { x: number; y: number } | null;
}

export interface EditorCanvasHostProps {
  className?: string;
  onLoad?: (window: Window) => void;
  appId: string;
  pageNodeId: NodeId;
  // TODO: Remove these when we get rid of PageView
  // eslint-disable-next-line react/no-unused-prop-types
  editor?: boolean;
  dom: appDom.AppDom;
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
  function EditorCanvasHost({ appId, className, pageNodeId, onLoad, dom, overlay }, forwardedRef) {
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

    const onReadyRef = React.useRef((window: Window) => {
      update();
      onLoad?.(window);
    });
    React.useEffect(() => {
      onReadyRef.current = (window: Window) => {
        update();
        onLoad?.(window);
      };
    }, [update, onLoad]);

    React.useEffect(() => {
      const frameWindow = frameRef.current?.contentWindow;
      if (!frameWindow) {
        throw new Error('Iframe ref not attached');
      }

      // eslint-disable-next-line no-underscore-dangle
      if (frameWindow.__TOOLPAD_READY__ === true) {
        onReadyRef.current?.(frameWindow);
        // eslint-disable-next-line no-underscore-dangle
      } else if (typeof frameWindow.__TOOLPAD_READY__ !== 'function') {
        // eslint-disable-next-line no-underscore-dangle
        frameWindow.__TOOLPAD_READY__ = () => onReadyRef.current?.(frameWindow);
      }
    }, []);

    const [contentWindow, setContentWindow] = React.useState<Window | null>(null);
    const [editorOverlayRoot, setEditorOverlayRoot] = React.useState<HTMLElement | null>(null);
    const [appRoot, setAppRoot] = React.useState<HTMLElement | null>(null);

    React.useImperativeHandle(
      forwardedRef,
      () => {
        return {
          getRootElm() {
            return appRoot;
          },
          getViewCoordinates(clientX, clientY) {
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
      },
      [appRoot],
    );

    const handleFrameLoad = React.useCallback(() => {
      setContentWindow(frameRef.current?.contentWindow || null);
    }, []);

    React.useEffect(() => {
      if (!contentWindow) {
        return () => {};
      }
      const observer = new MutationObserver(() => {
        setAppRoot(contentWindow.document.getElementById(HTML_ID_APP_ROOT));
        setEditorOverlayRoot(contentWindow.document.getElementById(HTML_ID_EDITOR_OVERLAY));
      });
      observer.observe(contentWindow.document.body, {
        subtree: true,
        childList: true,
      });
      return () => observer.disconnect();
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
