import * as React from 'react';
import { Box, CircularProgress, styled } from '@mui/material';
import { NodeId } from '@mui/toolpad-core';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import ReactDOM from 'react-dom';
import invariant from 'invariant';
import * as appDom from '../../../appDom';
import { HTML_ID_EDITOR_OVERLAY } from '../../../constants';
import { NodeHashes } from '../../../types';
import { ToolpadBridge } from '../../../canvas';
import useEvent from '../../../utils/useEvent';
import { LogEntry } from '../../../components/Console';
import { Maybe } from '../../../utils/types';
import { useDomApi } from '../../DomLoader';
import createRuntimeState from '../../../createRuntimeState';

type IframeContentWindow = Window & typeof globalThis;

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
  appId: string;
  pageNodeId: NodeId;
  dom: appDom.AppDom;
  savedNodes: NodeHashes;
  onConsoleEntry?: (entry: LogEntry) => void;
  overlay?: React.ReactNode;
  onInit?: (bridge: ToolpadBridge) => void;
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
  appId,
  className,
  pageNodeId,
  dom,
  savedNodes,
  overlay,
  onConsoleEntry,
  onInit,
}: EditorCanvasHostProps) {
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const domApi = useDomApi();

  const [bridge, setBridge] = React.useState<ToolpadBridge | null>(null);

  const updateOnBridge = React.useCallback(
    async (bridgeInstance: ToolpadBridge) => {
      const data = createRuntimeState({ appId, dom });
      bridgeInstance.update({ ...data, savedNodes });
    },
    [appId, dom, savedNodes],
  );

  React.useEffect(() => {
    if (bridge) {
      // Update every time dom prop updates
      updateOnBridge(bridge);
    }
  }, [updateOnBridge, bridge]);

  const handleInit = useEvent((newBridge: ToolpadBridge) => {
    setBridge(newBridge);
    onInit?.(newBridge);
    updateOnBridge(newBridge);
  });

  const onConsoleEntryRef = React.useRef(onConsoleEntry);
  React.useLayoutEffect(() => {
    onConsoleEntryRef.current = onConsoleEntry;
  });

  React.useEffect(() => {
    const frameWindow = frameRef.current?.contentWindow as Maybe<IframeContentWindow>;
    invariant(frameWindow, 'Iframe ref not attached');

    // eslint-disable-next-line no-underscore-dangle
    if (typeof frameWindow.__TOOLPAD_BRIDGE__ === 'object') {
      // eslint-disable-next-line no-underscore-dangle
      handleInit(frameWindow.__TOOLPAD_BRIDGE__);
      // eslint-disable-next-line no-underscore-dangle
      frameWindow.__TOOLPAD_BRIDGE__ = 'consumed';
      // eslint-disable-next-line no-underscore-dangle
    } else if (typeof frameWindow.__TOOLPAD_BRIDGE__ === 'undefined') {
      // eslint-disable-next-line no-underscore-dangle
      frameWindow.__TOOLPAD_BRIDGE__ = (newBridge: ToolpadBridge) => {
        handleInit(newBridge);
      };
    }
  }, [handleInit]);

  const [contentWindow, setContentWindow] = React.useState<Window | null>(null);
  const [editorOverlayRoot, setEditorOverlayRoot] = React.useState<HTMLElement | null>(null);

  const keyDownHandler = React.useCallback(
    (event: KeyboardEvent) => {
      const isZ = event.key.toLowerCase() === 'z';

      const undoShortcut = isZ && (event.metaKey || event.ctrlKey);
      const redoShortcut = undoShortcut && event.shiftKey;

      if (redoShortcut) {
        event.preventDefault();
        domApi.redo();
      } else if (undoShortcut) {
        event.preventDefault();
        domApi.undo();
      }
    },
    [domApi],
  );

  const handleFrameLoad = React.useCallback(() => {
    invariant(frameRef.current, 'Iframe ref not attached');

    const iframeWindow = frameRef.current.contentWindow;
    setContentWindow(iframeWindow);

    if (!iframeWindow) {
      return;
    }

    iframeWindow?.addEventListener('keydown', keyDownHandler);
    iframeWindow?.addEventListener('unload', () => {
      iframeWindow?.removeEventListener('keydown', keyDownHandler);
    });
  }, [keyDownHandler]);

  React.useEffect(() => {
    if (!contentWindow) {
      return undefined;
    }

    setEditorOverlayRoot(contentWindow.document.getElementById(HTML_ID_EDITOR_OVERLAY));

    const observer = new MutationObserver(() => {
      setEditorOverlayRoot(contentWindow.document.getElementById(HTML_ID_EDITOR_OVERLAY));
    });

    observer.observe(contentWindow.document.body, {
      subtree: true,
      childList: true,
    });

    return () => {
      observer.disconnect();
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
        name="data-toolpad-canvas"
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
}
